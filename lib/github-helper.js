'use strict';

import Debug from 'debug';

const debug = new Debug('mozilla-github-watcher:GitHub');

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
   * @return {Promise}              Promise which resolves with all repositories found
   */
  getAll() {
    const queue = [];

    this.orgNames.forEach((orgName) => {
      const promise = this.getNewRepos(orgName).catch((error) => {
        debug(`Fetch failed for ${orgName}:`, error);
        process.exit(1);
      });
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
    this.repos = [];
    debug(`start getting repos for ${orgName}`);

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
        const invalidResponse = !repositories || !Array.isArray(repositories);
        if (invalidResponse) {
          return reject(new Error(`we did not get a flat array back for ${orgName} on page ${page}!`));
        }

        debug(`got ${repositories.length} repositories for ${orgName}`);
        const strippedDownRepos = repositories.map((repo) => ({
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
        const hasMoreRepos = repositories && repositories.length === PAGE_SIZE && PAGE_SIZE * (page + 1) <= MAX_RETURN_ROWS_NEW;
        if (hasMoreRepos) {
          debug(`we need to get more for ${orgName}!`);
          return this.fetchPagesRecursively(++page, orgName, resolve, reject);
        }

        resolve();
      })
      .catch(reject);
  }
}

export default GitHubHelper;
