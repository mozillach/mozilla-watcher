'use strict';

const debug = require('debug')('index');
const GitHubHelper = require('./github-helper');
const RedisHandler = require('./redis-handler');

const githubHelper = new GitHubHelper();
const redisHandler = new RedisHandler();

const REPO_NAME = 'mozillach';

redisHandler.getLastCheckDate()
.then((lastCheckDate) => {
  return githubHelper.getNewRepos(REPO_NAME, lastCheckDate);
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
