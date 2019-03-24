'use strict';

const debug = require('debug')('mozilla-github-watcher:Storage');
const Storage = require('dom-storage');

const MAX_RETURN_ROWS_NEW = 200;

/**
 * Handler which manages the connection and saving the data.
 */
class StorageHandler {
  constructor() {
    debug('initializing..');

    this.storage = new Storage('./db.json', { strict: false, ws: '' });
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

    return new Promise((resolve) => {
      debug('saving difference data to localstorage..');

      this.storage.setItem('LAST_REPO_UPDATE', lastCheck);

      let allRepositories = newRepositories;
      if(allRepositories.length < MAX_RETURN_ROWS_NEW) {
        debug('adding existing repositories back');
        let existingRepositories = this.storage.getItem('REPOSITORIES') || [];
        allRepositories = allRepositories.concat(existingRepositories);
      }

      this.storage.setItem('REPOSITORIES', allRepositories.slice(0, MAX_RETURN_ROWS_NEW));

      debug('finished saving latest differences..');
      resolve(newRepositories);
    });
  }

  /**
   * Saves the latest wiki edits to the local storage
   *
   * @param  {Date}   lastCheck    date of last check
   * @param  {Array}  edots        list of newly discovered edits
   * @return {Promise}             Promise which will resolve once the data is saved
   */
  saveWikiEdits(lastCheck, edits) {
    debug('start saving wiki edits..');

    return new Promise((resolve) => {
      debug('saving edit data to localstorage..');

      this.storage.setItem('LAST_WIKI_UPDATE', lastCheck);
      this.storage.setItem('WIKI_EDITS', edits);

      debug('finished saving latest edits..');
      resolve(edits);
    });
  }

  /**
   * Returns the last check date from the localstorage
   *
   * @return {Promise} Promise which will resolve once the check date is fetched
   */
  getLastRepoCheckDate() {
    debug('start getting last check date..');

    return new Promise((resolve) => {
      const lastCheckDate = this.storage.getItem('LAST_REPO_UPDATE');
      debug('last check date was %s', lastCheckDate);

      resolve(lastCheckDate);
    });
  }

  /**
   * Returns an item from the storage with a given key
   *
   * @param {String} key  key to fetch from storage
   * @return {Object}     object from storage
   */
  getStorageItem(key) {
    return this.storage.getItem(key);
  }
}

module.exports = StorageHandler;
