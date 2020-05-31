const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = StorageHandler.getInstance();

router.get('/', async (req, res, next) => {
  try {
    const repos = await storageHandler.getRepos();
    const wikiEdits = await storageHandler.getWikiEdits();

    res.render('index', {
      repos,
      wikiEdits
    });
  } catch (error) {
    res.status(500);
    res.send('Could not fetch data');
  }
});

module.exports = router;
