'use strict';

const debug = require('debug')('GitHub');
const fetch = require('node-fetch');

class GitHubHelper {
  constructor() {
    this.repos = [];
  }

  /**
   * Queries the GitHub API to get all repositories of a given organization since
   * a given date. We need to traverse since there might be more than 100 repositories..
   *
   * @param  {String} orgName       organization name to query
   * @param  {String} lastCheckDate organization name to query
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getNewRepos(orgName, lastCheckDate) {
    debug(`getting repos for ${orgName}`);

    this.latestRunDate = new Date();

    return new Promise((resolve, reject) => {
      function fetchPage(page, repos) {
        debug(`getting page ${page}`);

        const url = `https://api.github.com/orgs/${orgName}/repos?per_page=100&page=${page}`;
        const options = {
          headers: {
            'User-Agent': 'MichaelKohler/mozilla-github-watcher',
            'Accept': 'application/vnd.github.v3+json'
          }
        };

        fetch(url, options).then((res) => {
          return res.json();
        }).then((repositories) => {
          debug(`got ${repositories.length} repositories`);

          repos = repos.concat(repositories);

          if (repositories && repositories.length === 100) {
            debug('we need to get more!');
            fetchPage(++page, repos);
          } else {
            resolve(repos);
          }
        }).catch((err) => {
          reject(err);
        });
      }

      fetchPage(1, this.repos);
    });
  }

  /**
   * Returns the last scan date
   *
   * @return {Date} date of the last scan
   */
  getLatestRunStartDate() {
    return this.latestRunDate;
  }
}

module.exports = GitHubHelper;
