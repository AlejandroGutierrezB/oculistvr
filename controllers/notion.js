const fs = require('fs').promises;
const { Client, LogLevel } = require('@notionhq/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getGameList = require('../helpers/notionHelpers');

const notion = new Client({
  auth: process.env.NOTION_KEY,
});
const databaseId = process.env.NOTION_DB_ID;

const getDb = async (dbId = databaseId) => {
  try {
    const response = await notion.databases.retrieve({
      database_id: dbId,
    });
    console.log('This is the db you retrieved', response);
    return response;
  } catch (error) {
    console.error('getDb - error', error.body);
  }
};

const queryDbPages = async (dbId = databaseId) => {
  const pageTitles = [];
  try {
    const response = await notion.databases.query({
      database_id: dbId,
      page_size: 100, //max
    });
    response.results.map((page) => {
      let title = page.properties['Title'].title[0].plain_text;
      pageTitles.push(title);
    });
    return { pageTitles, queryResult: response.results };
  } catch (error) {
    console.error('queryDbPages - error ', error);
  }
};

const checkIfCreateOrUpdatePage = async (
  dbId = databaseId,
  scrapedGameList
) => {
  const pagesToCreate = [];
  const pagesToUpdate = [];

  try {
    const { pageTitles, queryResult: prevPagesData } = await queryDbPages(dbId);
    const gameList = scrapedGameList || (await getGameList());
    if (gameList && pageTitles) {
      for (let game of gameList) {
        if (!pageTitles.includes(game.title)) {
          pagesToCreate.push(game);
        } else {
          const prevData = prevPagesData.find(
            (page) => game.title === page.properties.Title.title[0].plain_text
          );
          prevData.properties['CurrentPrice'].number !== game.price &&
            pagesToUpdate.push({
              title: game.title,
              pageId: prevData.id,
              newData: game,
              prevData: prevData.properties,
            });
        }
      }
    }
    console.log('Nº of new pages to Create', pagesToCreate.length);
    console.log('Nº of pages to Update', pagesToUpdate.length);
    return { pagesToCreate, pagesToUpdate };
  } catch (error) {
    console.error('checkIfCreateOrUpdatePage - error', error);
  }
};

const addPageToDb = async (game, dbId = databaseId) => {
  if (game.price === 'Free' || game.price === null) return;

  const captureDate = new Date().toISOString();
  try {
    await notion.pages.create({
      parent: { database_id: dbId },
      cover: {
        type: 'external',
        external: {
          url: game.image ? game.image : '',
        },
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: game.title,
                link: {
                  type: 'url',
                  url: game.href,
                },
              },
            },
          ],
        },
        TargetPrice: {
          number: game.price / 2,
        },
        CurrentPrice: {
          number: game.price,
        },
        HighestPrice: {
          number: game.price,
        },
        LowestPrice: {
          number: game.price,
        },
        HighestPriceDate: {
          date: {
            start: captureDate,
          },
        },
        LowestPriceDate: {
          date: {
            start: captureDate,
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: {
              url: game.image ? game.image : '',
            },
          },
        },
      ],
    });
    console.log('Success! Entry added.');
  } catch (error) {
    console.error('addPageToDb - error', error);
  }
};

const batchAddPageToDb = async (pagesToCreate, dbId = databaseId) => {
  if (pagesToCreate.length === 0) return;
  try {
    pagesToCreate.map(async (game) => {
      await addPageToDb(game, dbId);
    });
  } catch (error) {
    console.error('batchAddPageToDb -error ', error);
  }
};

const updatePageToDb = async (game) => {
  const updatedGame = game.prevData;
  if (game.newData.price < game.prevData['CurrentPrice'].number) {
    //TODO sengrid notification aslo if target price is reached
    if (game.prevData['LowestPrice'].number > game.newData.price) {
      updatedGame['LowestPrice'].number = game.newData.price;
      updatedGame['LowestPriceDate'].date.start = new Date().toISOString();
    }
  }
  if (game.newData.price > game.prevData['CurrentPrice'].number) {
    if (game.prevData['HighestPrice'].number < game.newData.price) {
      updatedGame['HighestPrice'].number = game.newData.price;
      updatedGame['HighestPriceDate'].date.start = new Date().toISOString();
    }
  }
  updatedGame['CurrentPrice'].number = game.newData.price; //always update current price
  //only upload relevant properties
  for (const property in updatedGame) {
    if (!property.match(/price/gi)) {
      delete updatedGame[property];
    }
  }

  try {
    await notion.pages.update({
      page_id: game.pageId,
      properties: updatedGame,
    });
    console.log(`Success! ${game.newData.title} updated.`);
  } catch (error) {
    // console.error('updatePageToDb - error', error);
  }
};

const batchUpdatePageToDb = async (pagesToUpdate) => {
  if (pagesToUpdate.length === 0) return;
  try {
    pagesToUpdate.map(async (game) => {
      await updatePageToDb(game);
    });
  } catch (error) {
    console.error('batchUpdatePageToDb - error', error);
  }
};

const batchUpdateNotionDb = async (scrapedGameList, dbId = databaseId) => {
  try {
    const { pagesToCreate, pagesToUpdate } = await checkIfCreateOrUpdatePage(
      dbId,
      scrapedGameList
    );

    await batchAddPageToDb(pagesToCreate, dbId);
    await batchUpdatePageToDb(pagesToUpdate);
  } catch (error) {
    console.error('batchUpdateNotionDb - error', error);
    throw error;
  }
};

module.exports = {
  getDb,
  queryDbPages,
  checkIfCreateOrUpdatePage,
  addPageToDb,
  batchAddPageToDb,
  updatePageToDb,
  batchUpdatePageToDb,
  batchUpdateNotionDb,
};
