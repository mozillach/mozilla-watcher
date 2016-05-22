'use strict';

const chalk = require('chalk');
const fetch = require('node-fetch');
const Logger = require('./logger');

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
  getRepos(orgName) {
    Logger.info(chalk.blue('GitHubHelper: '), `getting repos for ${orgName}`);

    return new Promise((resolve, reject) => {
      function fetchPage(page, repos) {
        Logger.info(chalk.blue('GitHubHelper: '), `getting page ${page}`);

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
          Logger.info(chalk.blue('GitHubHelper: '), `got ${repositories.length} repositories`);
          repos = repos.concat(repositories);
          if (repositories && repositories.length === 100) {
            Logger.info(chalk.blue('GitHubHelper: '), 'we need to get more!');
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
}

module.exports = GitHubHelper;
