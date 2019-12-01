const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = StorageHandler.getInstance();

router.get('/', async (req, res, next) => {
  const repos = await storageHandler.getRepos();
  const wikiEdits = await storageHandler.getWikiEdits();

  res.render('index', {
    repos,
    wikiEdits
  });
});

module.exports = router;
