const puppeteer = require('puppeteer');
const fs = require('fs').promises;
require('dotenv').config();

const getDate = require('./helpers/getDate');
const batchUpdateNotionDb = require('./helpers/notion');

(async (event, context) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.goto(
    'https://www.oculus.com/experiences/quest/section/274907549851488' // top paid games
  );

  // wait for cookie button to appear
  const CookieAcceptBtn = await page.$('[data-testid="cookie-dialog-button"]');
  if (CookieAcceptBtn) {
    //  accept cookies and wait for reload
    await CookieAcceptBtn.click();
    await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
  }

  // we need autoscroll to load all elements
  await autoScroll(page);
  const results = await page.$$eval('.section__items-cell', (games) => {
    return games.map((game) => {
      let [title, price] = game.innerText.split('\n');

      const priceWithoutCurrency = price.split(' ')[0];
      const priceWithDot = priceWithoutCurrency.replace(',', '.');
      price = price === null ? 0 : parseFloat(priceWithDot);

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
        price,
        href: `https://www.oculus.com${finalHref}`,
        image: imageUrl,
      };
    });
  });
  console.log('Games scraped and saved to json', results); //!
  await fs.writeFile(
    `./data/${getDate()}.json`,
    JSON.stringify(results, null, 2)
  );
  await browser.close();

  if (results && results.length > 0) {
    try {
      console.log('Updating notion');
      await batchUpdateNotionDb();
      console.log('Notion succesfully updated');
    } catch (error) {
      console.error(error);
    }
  }
})();

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
};
