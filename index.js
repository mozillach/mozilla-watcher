'use strict';

const debug = require('debug')('index');
const GitHubHelper = require('./lib/github-helper');
const RedisHandler = require('./lib/redis-handler');

const REPO_NAME = 'mozillach';
const githubHelper = new GitHubHelper(REPO_NAME);
const redisHandler = new RedisHandler();

redisHandler.getLastCheckDate()
.then((lastCheckDate) => {
  return githubHelper.getNewRepos(lastCheckDate);
})
.then((newRepositories) => {
  debug(`got ${newRepositories.length} new repositories`);

  let latestRunDate = githubHelper.getLatestRunStartDate();

  return redisHandler.saveDifference(latestRunDate, newRepositories);
})
.then((difference) => {
  debug('All done!', difference);
})
.catch((err) => {
  debug(err);
});;
