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
  getRepos(orgName, page = 1) {
    Logger.info(chalk.blue('GitHubHelper: '), `getting repos for ${orgName} with page ${page}`);

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
      }).then((repositories) => {
        Logger.info(chalk.blue('GitHubHelper: '), `got ${repositories.length} new repositories`);
        this.repos = this.repos.concat(repositories);
        resolve(repositories.length === 100);
      }).catch((err) => {
        reject(err);
      });
    }).then((hasMore) => {
      if (hasMore) {
        Logger.info(chalk.blue('GitHubHelper: '), 'getting more..');
        this.getRepos(orgName, ++page);
      } else {
        console.log(this.repos);
        return Promise.resolve(this.repos);
      }
    }).catch((err) => {
      Logger.error(chalk.blue('GitHubHelper:'), err);
      return Promise.reject([]);
    });
  }
}

module.exports = GitHubHelper;
