'use strict';

const debug = require('debug')('Wiki');
const fetch = require('node-fetch');

class WikiHelper {
  constructor() {
    this.edits = [];
    this.apiUrl = 'https://wiki.mozilla.org/api.php?action=query&list=recentchanges&rcprop=title|timestamp|user&rclimit=500&format=json';
    this.lastRun = null;
  }

  /**
   * Queries the Mozilla Wiki API for the latest 500 edits.
   *
   * @return {Promise} Promise which resolves with all repositories found
   */
  getLatestEdits() {
    debug('getting Wiki edits');

    return new Promise((resolve, reject) => {
      this.lastRun = new Date();

      fetch(this.apiUrl, {}).then((res) => {
        return res.json();
      }).then((data) => {
        this.edits = this.groupEdits(data.query.recentchanges);
        resolve(this.edits);
      });
    });
  }

  /**
   * Groups edits to get rid of duplication
   *
   * @param {Array} edits list of edits to group
   * @return {Array}      array of grouped edits
   */
  groupEdits(edits) {
    debug('grouping edits');
    let groupedEdits = [];

    edits.forEach((change) => {
      let alreadyIncluded = false;
      groupedEdits.forEach((groupedEdit) => {
        if (groupedEdit.title === change.title) {
          alreadyIncluded = true;
        }
      });

      if (!alreadyIncluded) {
        groupedEdits.push(change);
      }
    });

    return groupedEdits;
  }

  /**
   * Returns the last run date.
   *
   * @return {Date} last run date
   */
  getLastWikiCheckDate() {
    return this.lastRun;
  }
}

module.exports = WikiHelper;
