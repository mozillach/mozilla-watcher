'use strict';

const debug = require('debug')('index');
const Watcher = require('./watcher');

const watcher = new Watcher();
const REPO_NAME = 'mozillach';

watcher.discoverNewRepositories(REPO_NAME)
.then((newRepositories) => {
  debug('Difference was', newRepositories);
});
