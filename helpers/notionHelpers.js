const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getDate = require('./getDate');

const getGameList = async () => {
  try {
    const gamesString = await fs.readFile(
      path.resolve(__dirname, `../data/${getDate()}.json`)
    );
    const games = JSON.parse(gamesString);
    const filteredGames = games.filter((game) => game.price !== null);
    return filteredGames;
  } catch (error) {
    console.error('getGameList - error', error);
  }
};

module.exports = getGameList;
