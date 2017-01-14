'use strict';

const debug = require('debug')('index');
const args = require('optimist').argv;
const GitHubHelper = require('./lib/github-helper');
const StorageHandler = require('./lib/storage-handler');
const WikiHelper = require('./lib/wiki-helper');
const REPO_NAMES = require('./organizations.json');

const githubAuth = {
  username: args.username,
  token: args.token
};

const REPO_NAME = 'mozillach';
const githubHelper = new GitHubHelper(REPO_NAMES, githubAuth);
const storageHandler = new StorageHandler();
const wikiHelper = new WikiHelper();

async function fetchAll() {
  let lastCheckDate = await storageHandler.getLastRepoCheckDate();
  let newRepositories = await githubHelper.getAll(lastCheckDate);
  debug(`got ${newRepositories.length} new repositories`);

  let latestRunDate = githubHelper.getLatestRunStartDate();
  let difference = await storageHandler.saveDifference(latestRunDate, newRepositories);

  // TODO: this can run in parallel
  let newestEdits = await wikiHelper.getLatestEdits();
  let lastEditRunDate = wikiHelper.getLastWikiCheckDate();
  await storageHandler.saveWikiEdits(lastEditRunDate, newestEdits);

  debug('All done!');
}

debug('Starting everything...');
fetchAll();
