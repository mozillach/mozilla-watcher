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

    return new Promise((resolve, reject) => {
      debug('saving difference data to redis');

      // TODO: actually save it..

      debug('finished saving latest differences');
      resolve(newRepositories);
    });
  }

  /**
   * Returns the last check date from the redis store
   *
   * @return {Promise} Promise which will resolve once the check date is fetched
   */
  getLastCheckDate() {
    debug('start getting last check date..');

    return new Promise((resolve, reject) => {
      // TODO: actually get real date from DB

      var lastCheckDate = new Date('2016-08-19T23:22:17.491Z');
      debug('last check date was %s', lastCheckDate);

      resolve(lastCheckDate);
    });
  }
}

module.exports = RedisHandler;
