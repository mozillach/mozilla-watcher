'use strict';

const chalk = require('chalk');
const GitHubHelper = require('./github-helper');
const Logger = require('./logger');
const RedisHandler = require('./redis-handler');

/**
 * Watcher is the main Class which initiates the discovery and tells the RedisHandler
 * to initialize itself.
 */
class Watcher {
  constructor() {
    Logger.info(chalk.blue('Watcher: '), 'initializing..');
    this.redisHandler = new RedisHandler();
    this.githubHelper = new GitHubHelper();
  }

  /**
   * Calls the GitHub API to find out all current repositories. Once this is done
   * it gives the data to the RedisHandler to save the new data.
   *
   * @param  {String}    orgName  organization name to search for
   * @return {Promise}   Promise that resolves with the difference
   */
  discoverNewRepository(orgName) {
    return this.githubHelper.getRepos(orgName)
    .then((repositories) => {
      Logger.info(chalk.blue('GitHubHelper: '), repositories.length);
      const checkDate = new Date();
      return this.redisHandler.save(checkDate, repositories);
    }).then((repositories) => {
      return this.checkDifference(repositories);
    }).catch((err) => {
      Logger.error(chalk.blue('Watcher: '), err);
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
      const differenceDate = new Date();
      return this.redisHandler.saveDifference(differenceDate, difference);
    });
  }
}

module.exports = Watcher;
