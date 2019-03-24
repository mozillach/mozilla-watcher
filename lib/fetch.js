'use strict';

const debug = require('debug')('mozilla-github-watcher:fetch');
const GitHubHelper = require('./github-helper');
const StorageHandler = require('./storage-handler');
const WikiHelper = require('./wiki-helper');
const REPO_NAMES = require('../organizations.json');

const githubAuth = {
  username: process.env.GITHUB_USERNAME,
  token: process.env.GITHUB_TOKEN,
};

const githubHelper = new GitHubHelper(REPO_NAMES, githubAuth);
const storageHandler = new StorageHandler();
const wikiHelper = new WikiHelper();

debug('Starting everything...');
fetchAll();

async function fetchAll() {
  const lastCheckDate = await storageHandler.getLastRepoCheckDate();

  const [newRepositories, newestEdits] = await Promise.all([
    githubHelper.getAll(lastCheckDate),
    wikiHelper.getLatestEdits(),
  ]);

  debug(`got ${newRepositories.length} new repositories`);
  debug(`got ${newestEdits.length} wiki edits`);

  const latestRunDate = githubHelper.getLatestRunStartDate();
  await storageHandler.saveDifference(latestRunDate, newRepositories);

  const lastWikiRunDate = wikiHelper.getLastWikiCheckDate();
  await storageHandler.saveWikiEdits(lastWikiRunDate, newestEdits);

  debug('All done!');
}
