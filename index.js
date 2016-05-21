'use strict';

let chalk = require('chalk');
let Watcher = require('./watcher');

let watcher = new Watcher();

watcher.discoverNewRepository().then((newRepositories) => {
  console.log(chalk.green('Index: '), 'Difference was', newRepositories);
});
