'use strict';

import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON } from '../scripts/utils.js';

const debug = new Debug('mozilla-github-watcher:Storage');

const REPO_FILE = '../allRepos.json';
const WIKI_FILE = '../wikiEdits.json';
const filePath = fileURLToPath(import.meta.url);
const repoFilePath = path.resolve(path.dirname(filePath), REPO_FILE);
const wikiFilePath = path.resolve(path.dirname(filePath), WIKI_FILE);

let savedRepos = [];
try {
  savedRepos = await readJSON(REPO_FILE);
} catch (error) {
  debug(`Failed to open ${repoFilePath}`);
}

let savedWikiEdits = [];
try {
  savedWikiEdits = await readJSON(WIKI_FILE);
} catch (error) {
  debug(`Failed to open ${wikiFilePath}`);
}

const MAX_RETURN_ROWS_NEW = 200;

/**
   * Saves the latest repos to the storage
   *
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Object}                    saved data
   */
export function saveRepos(newRepositories) {
  debug(`start saving repos to ${repoFilePath}`);

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

  fs.writeFileSync(repoFilePath, JSON.stringify(repos));
}

/**
 * Saves the latest wiki edits to the storage
 *
 * @param  {Array}  edits        list of newly discovered edits
 * @return {Object}              saved data
 */
export function saveWikiEdits(edits) {
  debug(`start saving wiki edits to ${wikiFilePath}`);

  const wikiEdits = edits.map((edit) => {
    return {
      name: edit.title,
      user: edit.user,
      change_date: new Date(edit.timestamp),
    };
  });

  fs.writeFileSync(wikiFilePath, JSON.stringify(wikiEdits))
}

/**
 * Returns the saved repos
 *
 * @return {Array} repos repos from the db
 */
 export function getRepos() {
  return savedRepos;
}

/**
 * Returns the saved wiki edits
 *
 * @return {Array} edits edits from the db
 */
 export function getWikiEdits() {
  return savedWikiEdits;
}
