const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

const REPO_KEY = 'REPOSITORIES';
const WIKI_KEY = 'WIKI_EDITS';

/* GET home page. */
router.get('/', (req, res, next) => {
  const repos = storageHandler.getStorageItem(REPO_KEY);
  const wikiEdits = storageHandler.getStorageItem(WIKI_KEY);

  res.render('index', {
    repos,
    wikiEdits
  });
});

module.exports = router;
