'use strict';

const debug = require('debug')('mozilla-github-watcher:fetch');
const GitHubHelper = require('../lib/github-helper');
const WikiHelper = require('../lib/wiki-helper');
const storageHandler = require('../lib/storage-handler');
const REPO_NAMES = require('../organizations.json');

const githubAuth = {
  token: process.env.GITHUB_TOKEN,
};

const githubHelper = new GitHubHelper(REPO_NAMES, githubAuth);
const wikiHelper = new WikiHelper();

async function fetchAll() {
  const [newRepositories, newestEdits] = await Promise.all([
    githubHelper.getAll(),
    wikiHelper.getLatestEdits(),
  ]);

  debug(`got ${newRepositories.length} repositories`);
  debug(`got ${newestEdits.length} wiki edits`);

  storageHandler.saveRepos(newRepositories);
  storageHandler.saveWikiEdits(newestEdits);

  debug('FETCH_DONE');
}

fetchAll();
