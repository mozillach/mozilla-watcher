'use strict';

const debug = require('debug')('mozilla-github-watcher:Storage');
const mysql = require('mysql');

const MAX_RETURN_ROWS_NEW = 200;

const createReposTable = `
CREATE TABLE IF NOT EXISTS repos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  org VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  html_url VARCHAR(255) NOT NULL,
  owner_html_url VARCHAR(255) NOT NULL,
  creation_date DATE
)
`;

const createWikiTable = `
CREATE TABLE IF NOT EXISTS wiki (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user VARCHAR(255) NOT NULL,
  change_date DATE
)
`;

let instance;

module.exports = {
  getInstance,
}

function getInstance() {
  if (instance) {
    return instance;
  }

  instance = new StorageHandler();
  return instance;
}

class StorageHandler {
  connect() {
    return new Promise((resolve, reject) => {
      if (this.mysqlConnection) {
        return resolve();
      }

      debug('initializing mysql client..');
      const connectString = process.env.CONNECT;
      if (!connectString) {
        throw new Error('NO_CONNECT_ENV_VARIABLE');
      }

      this.mysqlConnection = mysql.createConnection(connectString);
      this.mysqlConnection.connect((err) => {
        if (err) {
          return reject(err);
        }

        debug('connected to database..');
        this.createTables();
        resolve();
      });
    });
  }

  /**
   * Creates all necessary DB tables if they do not exist yet
   */
  async createTables() {
    this.mysqlConnection.query(createReposTable, (error) => {
      if (error) {
        throw error;
      }

      debug('created repos table..');
    });

    this.mysqlConnection.query(createWikiTable, (error) => {
      if (error) {
        throw error;
      }

      debug('created wiki table..');
    });
  }

  /**
   * Saves the latest repos to the storage
   *
   * @param  {Array}   newRepositories   list of newly discovered repositories
   * @return {Object}                    saved data
   */
  async saveRepos(newRepositories) {
    await this.deleteRepos();

    debug('start saving repos..');
    const repos = newRepositories.slice(0, MAX_RETURN_ROWS_NEW);
    const promises = repos.map((repo) => new Promise((resolve, reject) => {
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

      this.mysqlConnection.query('INSERT INTO repos SET ?', processedRepo, (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }));

    return Promise.all(promises);
  }

  /**
   * Deletes all saved repos
   *
   * @return {Promise}
   */
  async deleteRepos() {
    return new Promise((resolve, reject) => {
      this.mysqlConnection.query('DELETE FROM repos', (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    });
  }

  /**
   * Saves the latest wiki edits to the storage
   *
   * @param  {Array}  edits        list of newly discovered edits
   * @return {Object}              saved data
   */
  async saveWikiEdits(edits) {
    debug('start saving wiki edits..');
    await this.deleteWikiEdits();

    const promises = edits.map((edit) => new Promise((resolve, reject) => {
      const processedRepo = {
        name: edit.title,
        user: edit.user,
        change_date: new Date(edit.timestamp),
      };

      this.mysqlConnection.query('INSERT INTO wiki SET ?', processedRepo, (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }));

    return Promise.all(promises);
  }

  /**
   * Deletes all saved edits
   *
   * @return {Promise}
   */
  async deleteWikiEdits() {
    return new Promise((resolve, reject) => {
      this.mysqlConnection.query('DELETE FROM wiki', (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    });
  }

  /**
   * Returns the saved repos
   *
   * @return {Array} repos repos from the db
   */
  async getRepos() {
    debug('start getting repos..');
    return new Promise((resolve, reject) => {
      this.mysqlConnection.query('SELECT * from repos ORDER BY creation_date DESC', (error, results) => {
        if (error) {
          return reject(error);
        }

        resolve(results);
      });
    });
  }

  /**
   * Returns the saved wiki edits
   *
   * @return {Array} edits edits from the db
   */
  async getWikiEdits() {
    debug('start getting edits..');
    return new Promise((resolve, reject) => {
      this.mysqlConnection.query('SELECT * from wiki ORDER BY change_date DESC', (error, results) => {
        if (error) {
          return reject(error);
        }

        resolve(results);
      });
    });
  }
}
