'use strict';

const debug = require('debug')('index');
const GitHubHelper = require('./lib/github-helper');
const StorageHandler = require('./lib/storage-handler');

const REPO_NAME = 'mozillach';
const githubHelper = new GitHubHelper(REPO_NAME);
const storageHandler = new StorageHandler();

storageHandler.getLastCheckDate()
.then((lastCheckDate) => {
  return githubHelper.getNewRepos(lastCheckDate);
})
.then((newRepositories) => {
  debug(`got ${newRepositories.length} new repositories`);

  let latestRunDate = githubHelper.getLatestRunStartDate();

  return storageHandler.saveDifference(latestRunDate, newRepositories);
})
.then((difference) => {
  debug('All done!', difference);
})
.catch((err) => {
  debug(err);
});;
