'use strict';

const debug = require('debug')('index');
const GitHubHelper = require('./lib/github-helper');
const StorageHandler = require('./lib/storage-handler');
const WikiHelper = require('./lib/wiki-helper');

const REPO_NAME = 'mozillach';
const githubHelper = new GitHubHelper(REPO_NAME);
const storageHandler = new StorageHandler();
const wikiHelper = new WikiHelper();

async function fetchAll() {
  let lastCheckDate = await storageHandler.getLastRepoCheckDate();
  let newRepositories = await githubHelper.getNewRepos(lastCheckDate);
  debug(`got ${newRepositories.length} new repositories`);

  let latestRunDate = githubHelper.getLatestRunStartDate();
  let difference = await storageHandler.saveDifference(latestRunDate, newRepositories);

  let newestEdits = await wikiHelper.getLatestEdits();
  let lastEditRunDate = wikiHelper.getLastWikiCheckDate();
  await storageHandler.saveWikiEdits(lastEditRunDate, newestEdits);

  debug('All done!');
}

debug('Starting everything...');
fetchAll();
