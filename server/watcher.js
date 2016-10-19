'use strict';

const debug = require('debug')('watcher');

const GitHubHelper = require('./github-helper');
const RedisHandler = require('./redis-handler');

/**
 * Watcher is the main Class which initiates the discovery and tells the RedisHandler
 * to initialize itself.
 */
class Watcher {
  constructor() {
    debug('initializing..');

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
  discoverNewRepositories(orgName) {
    return this.githubHelper.getRepos(orgName)
    .then((repositories) => {
      debug(`got ${repositories.length} repositories in total`);

      return this.checkDifference(repositories);
    }).then((difference) => {
      const checkDate = new Date();

      return this.redisHandler.saveDifference(checkDate, difference);
    }).catch((err) => {
      debug(err);
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
      // TODO: actually check the difference..
      resolve(['im new']);
    });
  }
}

module.exports = Watcher;
