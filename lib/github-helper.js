'use strict';

const debug = require('debug')('GitHub');
const fetch = require('node-fetch');

const MAX_RETURN_ROWS_NEW = 200;
const PAGE_SIZE = 100;

class GitHubHelper {
  constructor(orgNames, authentication) {
    this.repos = [];
    this.authentication = authentication;
    this.orgUrl = 'https://api.github.com/orgs';
    this.orgNames = orgNames;
  }

  /**
   * Initializes a query for all requested GitHub repositories.
   *
   * @param  {String} lastCheckDate last check date to compare against
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getAll(lastCheckDate) {
    this.lastCheckDate = lastCheckDate;

    const queue = [];

    this.orgNames.forEach((orgName) => {
      const promise = this.getNewRepos(orgName).catch(debug);
      queue.push(promise);
    });

    return Promise.all(queue).then(() => {
      debug('sorting repositories according to date..');
      // Sort dates newest -> oldest.
      this.repos.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      return this.repos;
    });
  }

  /**
   * Queries the GitHub API to get all repositories of a given organization since
   * a given date. We need to traverse since there might be more than 100 repositories..
   *
   * @param  {String} orgName       organization name to query
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getNewRepos(orgName) {
    debug(`start getting repos for ${orgName}`);
    this.latestRunDate = new Date();

    return new Promise((resolve, reject) => {
      this.fetchPagesRecursively(1, orgName, resolve, reject);
    });
  }

  /**
   * Fetches GitHub repositories for a given org recursively
   *
   * @param  {Integer}  page          page number of the current iteration
   * @param  {String}   orgName       organizaton name to fetch repositories from
   * @param  {Function} resolve      Promise resolve function
   * @param  {Function} reject       Promise reject function
   */
  fetchPagesRecursively(page, orgName, resolve, reject) {
    debug(`getting page ${page} for ${orgName}`);

    const params = `per_page=${PAGE_SIZE}&page=${page}&sort=created`;
    const fullUrl = `${this.orgUrl}/${orgName}/repos?${params}`;
    const options = {
      headers: {
        'User-Agent': 'MichaelKohler/mozilla-github-watcher',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': 'token ' + this.authentication.token,
      }
    };

    fetch(fullUrl, options).then((res) => res.json())
      .then((repositories) => {
        const invalidResponse = !repositories || (repositories.message && repositories.documentation_url);
        if (invalidResponse) {
          return reject(new Error(`we did not get a flat array back for ${orgName} on page ${page}!`));
        }

        debug(`got ${repositories.length} repositories for ${orgName}`);
        const newRepositories = repositories.filter((repo) => this.isNewRepository(repo));
        const strippedDownRepos = newRepositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          html_url: repo.html_url,
          owner: {
            login: repo.owner.login,
            html_url: repo.owner.html_url,
          },
          description: repo.description,
          created_at: repo.created_at,
        }));
        this.repos = this.repos.concat(strippedDownRepos);

        // Get next page if there are more repos that are new and we don't have the max that we display yet.
        const hasMoreRepos = repositories && newRepositories.length === PAGE_SIZE && PAGE_SIZE * (page + 1) <= MAX_RETURN_ROWS_NEW;
        if (hasMoreRepos) {
          debug(`we need to get more for ${orgName}!`);
          return this.fetchPagesRecursively(++page, orgName, resolve, reject);
        }

        resolve();
      })
      .catch(reject);
  }

  isNewRepository(repo) {
    if (!this.lastCheckDate) {
      return true;
    }

    const creationDate = new Date(repo.created_at);
    const lastCheckDate = new Date(this.lastCheckDate);

    return creationDate > lastCheckDate;
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
