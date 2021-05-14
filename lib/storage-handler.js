'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('mozilla-github-watcher:Storage');

const REPO_FILE = path.join(__dirname, '..', 'allRepos.json');
const WIKI_FILE = path.join(__dirname, '..', 'wikiEdits.json');

let savedRepos = [];
try {
  savedRepos = require(REPO_FILE);
} catch (error) {
  debug(`Failed to open ${REPO_FILE}`);
}

let savedWikiEdits = [];
try {
  savedWikiEdits = require(WIKI_FILE);
} catch (error) {
  debug(`Failed to open ${WIKI_FILE}`);
}

const MAX_RETURN_ROWS_NEW = 200;

module.exports = {
  saveRepos,
  saveWikiEdits,
  getRepos,
  getWikiEdits,
}

/**
   * Saves the latest repos to the storage
   *
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Object}                    saved data
   */
function saveRepos(newRepositories) {
  debug('start saving repos..');
  
  const repos = newRepositories
    .slice(0, MAX_RETURN_ROWS_NEW)
    .map((repo) => {
      const processedRepo = {
        name: repo.name,
        org: repo.owner.login,
        creation_date: new Date(repo.created_at),
        html_url: repo.html_url,
        owner_html_url: repo.owner.html_url,
      };

      if (repo.description) {
        processedRepo.description = repo.description.replace(/[^\x00-\x7F]/g, '');
      }
      
      return processedRepo;
    });

  fs.writeFileSync(REPO_FILE, JSON.stringify(repos));
}

/**
 * Saves the latest wiki edits to the storage
 *
 * @param  {Array}  edits        list of newly discovered edits
 * @return {Object}              saved data
 */
function saveWikiEdits(edits) {
  debug('start saving wiki edits..');

  const wikiEdits = edits.map((edit) => {
    return {
      name: edit.title,
      user: edit.user,
      change_date: new Date(edit.timestamp),
    };
  });

  fs.writeFileSync(WIKI_FILE, JSON.stringify(wikiEdits))
}

/**
 * Returns the saved repos
 *
 * @return {Array} repos repos from the db
 */
function getRepos() {
  return savedRepos;
}

/**
 * Returns the saved wiki edits
 *
 * @return {Array} edits edits from the db
 */
function getWikiEdits() {
  return savedWikiEdits;
}
