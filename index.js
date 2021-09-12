const gameScraper = require('./controllers/gameScraper');
const { batchUpdateNotionDb } = require('./controllers/notion');

(async () => {
  try {
    const results = await gameScraper();
    if (results && results.length > 0) {
      console.log('Updating notion');
      await batchUpdateNotionDb(results, undefined);
      console.log('Notion succesfully updated');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
