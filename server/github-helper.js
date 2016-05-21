'use strict';

const request = require('request');

class GitHubHelper {
  constructor() {
    this.repos = [];
  }

  /**
   * Queries the GitHub API to get all repositories of a given organization.
   * We need to traverse since there might be more than 100 repositories..
   *
   * @param  {String} orgName organization name to query
   * @return {Promise}        Promise which resolves with all repositories found
   */
  getRepos(orgName, page = 1) {
    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://api.github.com/orgs/' + orgName + '/repos?per_page=100&page=' + page,
        headers: {
          'User-Agent': 'MichaelKohler/mozilla-github-watcher',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      request(options, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          reject({ error, response });
        } else {
          const fetchedRepos = JSON.parse(body);
          console.log(fetchedRepos.length);
          resolve(fetchedRepos);
        }
      });
    });
  }
}

module.exports = GitHubHelper;
