'use strict';

const fetch = require('node-fetch');

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
      const url = 'https://api.github.com/orgs/' + orgName + '/repos?per_page=100&page=' + page;
      const options = {
        headers: {
          'User-Agent': 'MichaelKohler/mozilla-github-watcher',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      fetch(url, options).then((res) => {
    		return res.json();
    	}).then((json) => {
    		resolve(json);
    	}).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = GitHubHelper;
