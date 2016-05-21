'use strict';

let chalk = require('chalk');
let Logger = require('./logger');
let Watcher = require('./watcher');

let watcher = new Watcher();

watcher.discoverNewRepository().then((newRepositories) => {
  Logger.success(chalk.green('Index: '), 'Difference was', newRepositories);
});
