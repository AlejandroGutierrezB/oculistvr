const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getDate = require('../helpers/getDate');
const autoScroll = require('../helpers/autoScroll');
const { URL_TOP_PAID_GAMES } = require('../helpers/constants');

const isHeadless =
  process.env.NODE_ENV === 'headless' || process.env.NODE_ENV === 'production'
    ? true
    : false;

const gameScraper = async (event, context) => {
  console.log('Scraping with puppeteer started...');
  try {
    const browser = await puppeteer.launch({
      headless: isHeadless,
      args: [
        '--window-size=1920,1080',
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
      ],
    });

    const page = await browser.newPage();
    await page.goto(URL_TOP_PAID_GAMES);

    // wait for cookie button to appear
    const CookieAcceptBtn = await page.$(
      '[data-testid="cookie-dialog-button"]'
    );
    if (CookieAcceptBtn) {
      //  accept cookies and wait for reload
      await CookieAcceptBtn.click();
      await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
    }

    // we need autoscroll to load all elements
    await autoScroll(page);
    //scrape and normalize data
    const results = await page.$$eval(
      '.section__items-cell',
      (games) => {
        return games.map((game, isHeadless) => {
          let [title, price] = game.innerText.split('\n');
          const hasDiscount = price.includes('%');
          const cleanPriceWhenDiscounted =
            hasDiscount && isHeadless
              ? price.split('€')[1] //"-29%€24.62€34.98" --> "€24.62€34.98",
              : hasDiscount && !isHeadless
              ? price.split('€')[0].split('%')[1] //"-29%24.62€34.98€"",
              : price;

          const normalizedPrice = cleanPriceWhenDiscounted
            .replace(/[€$]+/g, '')
            .replace(',', '.')
            .trim();
          const parsedPrice = Number(
            Math.round(parseFloat(normalizedPrice + 'e2')) + 'e-2'
          );

          const finalHref = game.innerHTML.match(/href="(.*?)"/)[1];
          const [trash, ...baseImageUrl] = game.innerHTML
            .match(/style="(.*?)"/)[1]
            .split(';');
          const imageUrl = baseImageUrl
            .join('')
            .replace(/amp/g, '')
            .split('&quot')[0];

          return {
            title,
            price: parsedPrice,
            href: `https://www.oculus.com${finalHref}`,
            image: imageUrl,
            hasDiscount,
            discount: hasDiscount && price.split('%')[0].trim() + '%',
          };
        });
      },
      isHeadless
    );

    await fs.writeFile(
      path.resolve(__dirname, `../data/${getDate()}.json`),
      JSON.stringify(results, null, 2)
    );
    console.log('Games scraped and saved to json');

    await browser.close();
    console.log('Scrapping finished and puppeteer closed');
    return results;
  } catch (error) {
    console.error('gameScraper error', error);
    throw error;
  }
};

module.exports = gameScraper;
