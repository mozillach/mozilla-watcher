'use strict';

const debug = require('debug')('Storage');
const Storage = require('dom-storage');

/**
 * Handler for Redis which manages the connection and saving the data.
 */
class StorageHandler {
  constructor() {
    debug('initializing..');

    this.storage = new Storage('./db.json', { strict: false, ws: '  ' });
  }

  /**
   * Saves the latest differences to the local storage
   *
   * @param  {Date}    lastCheck         Date of the last check
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Promise}                   Promise which will resolve once the data is saved
   */
  saveDifference(lastCheck, newRepositories) {
    debug('start saving difference..');
    debug('difference was at', lastCheck);

    return new Promise((resolve, reject) => {
      debug('saving difference data to localstorage');

      this.storage.setItem('LAST_UPDATE', lastCheck);

      let existingRepositories = this.storage.getItem('REPOSITORIES') || [];
      let allRepositories = existingRepositories.concat(newRepositories);

      this.storage.setItem('REPOSITORIES', allRepositories);

      debug('finished saving latest differences');
      resolve(newRepositories);
    });
  }

  /**
   * Returns the last check date from the localstorage
   *
   * @return {Promise} Promise which will resolve once the check date is fetched
   */
  getLastCheckDate() {
    debug('start getting last check date..');

    return new Promise((resolve, reject) => {
      const lastCheckDate = this.storage.getItem('LAST_UPDATE');
      debug('last check date was %s', lastCheckDate);

      resolve(lastCheckDate);
    });
  }
}

module.exports = StorageHandler;
