const fs = require('fs');
const path = require('path');
const pug = require('pug');
const debug = require('debug')('mozilla-github-watcher:build-index');

const storageHandler = require('../lib/storage-handler');

const INDEX_PUG_PATH = path.join(__dirname, '../index.pug');
const INDEX_FILE_PATH = path.join(__dirname, '../public/index.html');

debug('Getting data...')
const repos = storageHandler.getRepos();
const wikiEdits = storageHandler.getWikiEdits();

debug('Rendering HTML...')
const html = pug.renderFile(INDEX_PUG_PATH, {
  repos,
  wikiEdits,
});

debug('Writing HTML...')
fs.writeFileSync(INDEX_FILE_PATH, html);
