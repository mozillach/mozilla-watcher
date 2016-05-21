'use strict';

let chalk = require('chalk');
let redis = require('redis');
let Logger = require('./logger');

/**
 * Handler for Redis which manages the connection and saving the data.
 */
class RedisHandler {
  constructor() {
    Logger.info(chalk.yellow('RedisHandler: '), 'initializing..');
  }

  /**
   * Saves the latest repository data to redis so we can check against it
   *
   * @param  {Date}    lastCheck Date of the last check
   * @param  {Array}   data      list of repositories
   * @return {Promise}           Promise which will resolve once the data is saved
   */
  save(lastCheck, data) {
    Logger.info(chalk.yellow('RedisHandler: '), 'start saving..');
    Logger.info(chalk.yellow('RedisHandler: '), 'last check was at', lastCheck);
    Logger.info(chalk.yellow('RedisHandler: '), 'with data', data);

    return new Promise((resolve, reject) => {
      Logger.info(chalk.yellow('RedisHandler: '), 'saving data to redis');

      // TODO: actually save it..

      Logger.success(chalk.yellow('RedisHandler: '), 'finished saving latest info');
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
