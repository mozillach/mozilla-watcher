'use strict';

const debug = require('debug')('Redis');
const redis = require('redis');

/**
 * Handler for Redis which manages the connection and saving the data.
 */
class RedisHandler {
  constructor() {
    debug('initializing..');
  }

  /**
   * Saves the latest differences to redis
   *
   * @param  {Date}    lastCheck         Date of the last check
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Promise}                   Promise which will resolve once the data is saved
   */
  saveDifference(lastCheck, newRepositories) {
    debug('start saving difference..');
    debug('difference was at', lastCheck);
    debug('with data', newRepositories);

    return new Promise((resolve, reject) => {
      debug('saving difference data to redis');

      // TODO: actually save it..

      debug('finished saving latest differences');
      resolve(newRepositories);
    });
  }
}

module.exports = RedisHandler;
