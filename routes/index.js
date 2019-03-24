const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

const REPO_KEY = 'REPOSITORIES';
const WIKI_KEY = 'WIKI_EDITS';

router.get('/', async (req, res, next) => {
  const repos = await storageHandler.getStorageItem(REPO_KEY);
  const wikiEdits = await storageHandler.getStorageItem(WIKI_KEY);

  res.render('index', {
    repos,
    wikiEdits
  });
});

module.exports = router;
