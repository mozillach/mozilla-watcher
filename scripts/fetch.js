'use strict';

import Debug from 'debug';
import GitHubHelper from '../lib/github-helper.js';
import WikiHelper from '../lib/wiki-helper.js';
import * as storageHandler from '../lib/storage-handler.js';
import { readJSON } from './utils.js';

const debug = new Debug('mozilla-github-watcher:fetch');

const githubAuth = {
  token: process.env.GITHUB_TOKEN,
};

const orgNames = await readJSON('../organizations.json');
const githubHelper = new GitHubHelper(orgNames, githubAuth);
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
