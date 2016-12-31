'use strict';

const debug = require('debug')('index');
const GitHubHelper = require('./lib/github-helper');
const StorageHandler = require('./lib/storage-handler');

const REPO_NAME = 'mozillach';
const githubHelper = new GitHubHelper(REPO_NAME);
const storageHandler = new StorageHandler();

async function fetchAll() {
  let lastCheckDate = await storageHandler.getLastCheckDate();
  let newRepositories = await githubHelper.getNewRepos(lastCheckDate);
  debug(`got ${newRepositories.length} new repositories`);

  let latestRunDate = githubHelper.getLatestRunStartDate();
  let difference = await storageHandler.saveDifference(latestRunDate, newRepositories);

  debug('All done!');
}

debug('Starting everything...');
fetchAll();
