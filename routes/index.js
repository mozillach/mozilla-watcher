const express = require('express');
const StorageHandler = require('../lib/storage-handler');
const router = express.Router();
const storageHandler = new StorageHandler();

const REPO_KEY = 'REPOSITORIES';
const WIKI_KEY = 'WIKI_EDITS';

/* GET home page. */
router.get('/', (req, res, next) => {
  const repos = storageHandler.getStorageItem(REPO_KEY).sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  }).slice(0, 100);;

  const updatedRepos = storageHandler.getStorageItem(REPO_KEY).sort((a, b) => {
    return new Date(b.updated_at) - new Date(a.updated_at);
  }).slice(0, 100);

  const wikiEdits = storageHandler.getStorageItem(WIKI_KEY);

  res.render('index', {
    title: 'What is happening inside Mozilla?',
    repos,
    updatedRepos,
    wikiEdits
  });
});

module.exports = router;
