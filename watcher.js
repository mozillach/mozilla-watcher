'use strict';

let chalk = require('chalk');
let request = require('request');
let RedisHandler = require('./redis-handler');

/**
 * Watcher is the main Class which initiates the discovery and tells the RedisHandler
 * to initialize itself.
 */
class Watcher {
  constructor() {
    console.log(chalk.blue('Watcher: '), 'initializing..');
    this.redisHandler = new RedisHandler();
  }

  /**
   * Calls the GitHub API to find out all current repositories. Once this is done
   * it gives the data to the RedisHandler to save the new data.
   *
   * @return {Promise}   Promise that resolves with the difference
   */
  discoverNewRepository() {
    return new Promise((resolve, reject) => {
      resolve(['foo']);
    }).then((repositories) => {
      let checkDate = new Date();
      return this.redisHandler.save(checkDate, repositories);
    }).then((repositories) => {
      return this.checkDifference(repositories);
    });
  }

  /**
   * Gets the latest data from the Redis and compares to the newly fetched data
   *
   * @param  {Array}   repositories  list of repositories
   * @return {Promise}               Promise which will resolve with the difference
   */
  checkDifference(repositories) {
    return new Promise((resolve, reject) => {
      resolve(['im new']);
    }).then((difference) => {
      let differenceDate = new Date();
      return this.redisHandler.saveDifference(differenceDate, difference);
    });
  }
}

module.exports = Watcher;
