'use strict';

let chalk = require('chalk');
let redis = require('redis');

/**
 * Handler for Redis which manages the connection and saving the data.
 */
class RedisHandler {
  constructor() {
    console.log(chalk.yellow('RedisHandler: '), 'initializing..');
  }

  /**
   * Saves the latest repository data to redis so we can check against it
   *
   * @param  {Date}    lastCheck Date of the last check
   * @param  {Array}   data      list of repositories
   * @return {Promise}           Promise which will resolve once the data is saved
   */
  save(lastCheck, data) {
    console.log(chalk.yellow('RedisHandler: '), 'start saving..');
    console.log(chalk.yellow('RedisHandler: '), 'last check was at', lastCheck);
    console.log(chalk.yellow('RedisHandler: '), 'with data', data);

    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('RedisHandler: '), 'saving data to redis');

      // TODO: actually save it..

      console.log(chalk.yellow('RedisHandler: '), 'finished saving latest info');
      resolve(data);
    });
  }

  /**
   * Saves the latest differences to redis
   *
   * @param  {Date}    lastCheck         Date of the last check
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Promise}                   Promise which will resolve once the data is saved
   */
  saveDifference(lastCheck, newRepositories) {
    console.log(chalk.yellow('RedisHandler: '), 'start saving difference..');
    console.log(chalk.yellow('RedisHandler: '), 'difference was at', lastCheck);
    console.log(chalk.yellow('RedisHandler: '), 'with data', newRepositories);

    return new Promise((resolve, reject) => {
      console.log(chalk.yellow('RedisHandler: '), 'saving difference data to redis');

      // TODO: actually save it..

      console.log(chalk.yellow('RedisHandler: '), 'finished saving latest differences');
      resolve(newRepositories);
    });
  }
}

module.exports = RedisHandler;
