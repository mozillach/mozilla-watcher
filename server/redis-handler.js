'use strict';

const chalk = require('chalk');
const redis = require('redis');
const Logger = require('./logger');

/**
 * Handler for Redis which manages the connection and saving the data.
 */
class RedisHandler {
  constructor() {
    Logger.info(chalk.yellow('RedisHandler: '), 'initializing..');
  }

  /**
   * Saves the latest differences to redis
   *
   * @param  {Date}    lastCheck         Date of the last check
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Promise}                   Promise which will resolve once the data is saved
   */
  saveDifference(lastCheck, newRepositories) {
    Logger.info(chalk.yellow('RedisHandler: '), 'start saving difference..');
    Logger.info(chalk.yellow('RedisHandler: '), 'difference was at', lastCheck);
    Logger.info(chalk.yellow('RedisHandler: '), 'with data', newRepositories);

    return new Promise((resolve, reject) => {
      Logger.info(chalk.yellow('RedisHandler: '), 'saving difference data to redis');

      // TODO: actually save it..

      Logger.success(chalk.yellow('RedisHandler: '), 'finished saving latest differences');
      resolve(newRepositories);
    });
  }
}

module.exports = RedisHandler;
