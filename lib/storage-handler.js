'use strict';

const debug = require('debug')('mozilla-github-watcher:Storage');
const redis = require('redis');
const { promisify } = require('util');

const MAX_RETURN_ROWS_NEW = 200;

let redisClient;

class StorageHandler {
  constructor() {
    if (!redisClient) {
      debug('initializing redis client..', process.env.REDIS_URL);
      const redisOptions = {
        url: process.env.REDIS_URL,
      };

      if (process.env.REDIS_PASSWORD) {
        redisOptions.password = process.env.REDIS_PASSWORD;
      }

      redisClient = redis.createClient(redisOptions);

      redisClient.on('error', (err) => {
        console.error('REDIS_ERROR', err);
      });
    }

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient);
    this.deleteRedisAsync = promisify(redisClient.del).bind(redisClient);
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient);
  }

  /**
   * Saves the latest repos to the storage
   *
   * @param  {Date}    lastCheck         Date of the last check
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Object}                    saved data
   */
  async saveRepos(lastCheck, newRepositories) {
    debug('start saving difference..', lastCheck);

    await this.setRedisAsync('LAST_REPO_UPDATE', lastCheck);
    const serializedRepos = JSON.stringify(newRepositories.slice(0, MAX_RETURN_ROWS_NEW));
    await this.deleteRedisAsync('REPOSITORIES');
    await this.setRedisAsync('REPOSITORIES', serializedRepos);

    debug('finished saving latest repos..');
    return newRepositories;
  }

  /**
   * Saves the latest wiki edits to the storage
   *
   * @param  {Date}   lastCheck    date of last check
   * @param  {Array}  edots        list of newly discovered edits
   * @return {Object}              saved data
   */
  async saveWikiEdits(lastCheck, edits) {
    debug('start saving wiki edits..');

    await this.setRedisAsync('LAST_WIKI_UPDATE', lastCheck);
    const serializedEdits = JSON.stringify(edits);
    await this.setRedisAsync('WIKI_EDITS', serializedEdits);

    debug('finished saving latest edits..');
    return edits;
  }

  /**
   * Returns the last check date from the redis
   *
   * @return {String} lastCheckDate last check date
   */
  async getLastRepoCheckDate() {
    debug('start getting last check date..');

    const lastCheckDate = await this.getRedisAsync('LAST_REPO_UPDATE');
    return lastCheckDate;
  }

  /**
   * Returns an item from the storage with a given key
   *
   * @param {String} key  key to fetch from storage
   * @return {Object}     object from storage
   */
  async getStorageItem(key) {
    const unserializedData = await this.getRedisAsync(key);
    try {
      const data = JSON.parse(unserializedData);
      return data;
    } catch (err) {
      debug('FAILED_SERIALIZING_DATA', unserializedData);
      return {};
    }
  }
}

module.exports = StorageHandler;
