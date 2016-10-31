'use strict';

const debug = require('debug')('GitHub');
const fetch = require('node-fetch');

class GitHubHelper {
  constructor(orgName) {
    this.repos = [];
    this.orgUrl = 'https://api.github.com/orgs';
    this.orgName = orgName;
  }

  /**
   * Queries the GitHub API to get all repositories of a given organization since
   * a given date. We need to traverse since there might be more than 100 repositories..
   *
   * @param  {String} orgName       organization name to query
   * @param  {String} lastCheckDate organization name to query
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getNewRepos(lastCheckDate) {
    debug(`getting repos for ${this.orgName}`);

    this.lastCheckDate = lastCheckDate;
    this.latestRunDate = new Date();

    return new Promise((resolve, reject) => {
      // TODO: is there a better way to do this than passing resolve and reject?
      this.fetchPagesRecursively(1, resolve, reject);
    });
  }

  fetchPagesRecursively(page, resolve, reject) {
    debug(`getting page ${page}`);

    const params = `per_page=100&page=${page}`;
    const fullUrl = `${this.orgUrl}/${this.orgName}/repos?${params}`;
    const options = {
      headers: {
        'User-Agent': 'MichaelKohler/mozilla-github-watcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    fetch(fullUrl, options).then((res) => {
      return res.json();
    }).then((repositories) => {
      debug(`got ${repositories.length} repositories`);

      let newRepositories = repositories.filter((repo) => {
        if (!this.lastCheckDate) {
          return true;
        }

        let creationDate = new Date(repo.created_at);
        let lastCheckDate = new Date(this.lastCheckDate);

        return creationDate > lastCheckDate;
      });

      this.repos = this.repos.concat(newRepositories);

      if (repositories && repositories.length === 100) {
        debug('we need to get more!');
        this.fetchPagesRecursively(++page, resolve, reject);
      } else {
        resolve(this.repos);
      }
    }).catch((err) => {
      reject(err);
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
