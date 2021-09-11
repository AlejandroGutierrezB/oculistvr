// const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
require('dotenv').config();

(async (event, context) => {
  const browser = await puppeteer.launch({
    headless: false, //!
    args: [
      '--window-size=1920,1080',
      // "--no-sandbox",
      // "--disable-setuid-sandbox"
    ],
  });

  const page = await browser.newPage();
  await page.goto(
    'https://www.oculus.com/experiences/quest/section/554169918379884' // most popular games
  );

  // wait for cookie button to appear
  const CookieAcceptBtn = await page.$('[data-testid="cookie-dialog-button"]');
  if (CookieAcceptBtn) {
    //  accept cookies and wait for reload
    await CookieAcceptBtn.click();
    await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
  }

  // we need autoscroll to load all elements
  // await autoScroll(page);
  const results = await page.$$eval('.section__items-cell', (games) => {
    return games.map((game) => {
      console.log('🚀 ~ file: meta.js ~ line 20 ~ results ~ game', game);
      let [title, price] = game.innerText.split('\n');

      const priceWithoutCurrency = price.split(' ')[0];
      const priceWithDot = priceWithoutCurrency.replace(',', '.');
      price = price === null ? 0 : parseFloat(priceWithDot);

      const finalHref = game.innerHTML.match(/href="(.*?)"/)[1];

      return {
        title,
        price,
        href: `https://www.oculus.com${finalHref}`,
        image: game.href, //!
      };
    });
  });
  console.log('🚀 ~ file: index.js ~ line 48 ~ results ~ results', results);

  //grid
  // '/html/body/div/div[1]/div[3]/div[3]/div/div[2]/div/div/div[2]'
  //class="section__items-cell"-->class="store-section-item"
  //<a href=`/experiences/quest/${id}` url>"
  //class="store-section-item__meta"-->class="store-section-item__meta-name"
  //nested divs until span-->span

  // await browser.close();
})();

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
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
