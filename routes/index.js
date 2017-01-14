const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

const REPO_KEY = 'REPOSITORIES';
const WIKI_KEY = 'WIKI_EDITS';

/* GET home page. */
router.get('/', (req, res, next) => {
  const allRepos = storageHandler.getStorageItem(REPO_KEY);
  const repos = allRepos.slice(0, 100);
  const wikiEdits = storageHandler.getStorageItem(WIKI_KEY);

  res.render('index', {
    title: 'What is happening inside Mozilla?',
    repos,
    wikiEdits
  });
});

module.exports = router;
