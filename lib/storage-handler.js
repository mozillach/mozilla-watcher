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

      this.storage.setItem('LAST_REPO_UPDATE', lastCheck);

      let existingRepositories = this.storage.getItem('REPOSITORIES') || [];
      let allRepositories = existingRepositories.concat(newRepositories);

      this.storage.setItem('REPOSITORIES', allRepositories);

      debug('finished saving latest differences');
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

    return new Promise((resolve, reject) => {
      debug('saving edit data to localstorage');

      this.storage.setItem('LAST_WIKI_UPDATE', lastCheck);
      this.storage.setItem('WIKI_EDITS', edits);

      debug('finished saving latest edits');
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

    return new Promise((resolve, reject) => {
      const lastCheckDate = this.storage.getItem('LAST_REPO_UPDATE');
      debug('last check date was %s', lastCheckDate);

      resolve(lastCheckDate);
    });
  }
}

module.exports = StorageHandler;
