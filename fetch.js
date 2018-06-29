'use strict';

const debug = require('debug')('fetch');
const args = require('optimist').argv;
const GitHubHelper = require('./lib/github-helper');
const StorageHandler = require('./lib/storage-handler');
const WikiHelper = require('./lib/wiki-helper');
const REPO_NAMES = require('./organizations.json');

const githubAuth = {
  username: args.username,
  token: args.token,
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
  const difference = await storageHandler.saveDifference(latestRunDate, newRepositories);

  const lastWikiRunDate = wikiHelper.getLastWikiCheckDate();
  await storageHandler.saveWikiEdits(lastWikiRunDate, newestEdits);

  debug('All done!');
}
