'use strict';

const debug = require('debug')('mozilla-github-watcher:fetch');
const GitHubHelper = require('./github-helper');
const StorageHandler = require('./storage-handler');
const WikiHelper = require('./wiki-helper');
const REPO_NAMES = require('../organizations.json');

const githubAuth = {
  token: process.env.GITHUB_TOKEN,
};

const githubHelper = new GitHubHelper(REPO_NAMES, githubAuth);
const storageHandler = StorageHandler.getInstance();
const wikiHelper = new WikiHelper();

module.exports = {
  fetchAll,
};

async function fetchAll() {
  await storageHandler.connect();

  const [newRepositories, newestEdits] = await Promise.all([
    githubHelper.getAll(),
    wikiHelper.getLatestEdits(),
  ]);

  debug(`got ${newRepositories.length} repositories`);
  debug(`got ${newestEdits.length} wiki edits`);

  await storageHandler.saveRepos(newRepositories);
  await storageHandler.saveWikiEdits(newestEdits);

  debug('FETCH_DONE');
}
