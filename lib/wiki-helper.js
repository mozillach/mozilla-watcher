'use strict';

import Debug from 'debug';

const debug = new Debug('mozilla-github-watcher:Wiki');
const BASE_URL = 'https://wiki.mozilla.org/api.php';
const FIELDS = 'title|timestamp|user';
const LIST = 'recentchanges';
const ACTION = 'query';
const LIMIT = 500;
const FORMAT = 'json';
const LAST_EDITS_URL = `${BASE_URL}?action=${ACTION}&list=${LIST}&rcprop=${FIELDS}&rclimit=${LIMIT}&format=${FORMAT}`;

class WikiHelper {
  constructor() {
    this.apiUrl = LAST_EDITS_URL;
  }

  /**
   * Queries the Mozilla Wiki API for the latest 500 edits.
   *
   * @return {Promise} Promise which resolves with all repositories found
   */
  getLatestEdits() {
    debug('getting Wiki edits..', this.apiUrl);

    return new Promise((resolve) => {
      fetch(this.apiUrl).then((res) => res.json())
        .then((data) => {
          const edits = this.groupEdits(data.query.recentchanges);
          resolve(edits);
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
    const groupedEdits = [];

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
}

export default WikiHelper;
