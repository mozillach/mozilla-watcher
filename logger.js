'use strict';

const chalk = require('chalk');

/**
 * Simple Logger which adds additional info to the logs.
 */
class Logger {
  static info(...logMessages) {
    const date = new Date();
    console.log(chalk.cyan('Info:\t\t'), date, '\t', ...logMessages);
  }

  static error(...logMessages) {
    const date = new Date();
    console.log(chalk.red('Error:\t\t'), date, '\t', ...logMessages);
  }

  static warn(...logMessages) {
    const date = new Date();
    console.log(chalk.yellow('Warning:\t'), date, '\t', ...logMessages);
  }

  static success(...logMessages) {
    const date = new Date();
    console.log(chalk.green('Success:\t'), date, '\t', ...logMessages);
  }
}

module.exports = Logger;
