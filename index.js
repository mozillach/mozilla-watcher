#!/usr/bin/env node

const debug = require('debug')('mozilla-github-watcher:server');
const http = require('http');
const cron = require('node-cron');
const app = require('./app');
const fetch = require('./lib/fetch');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

debug('registering cronjob to run every hour at minute 23..');
cron.schedule('0 23 * * * *', () => {
  fetch.fetchAll()
    .catch((err) => {
      debug('CRONJOB_FETCH_FAILED', err);
    });
});

fetch.fetchAll()
  .catch((err) => {
    debug('INITIAL_FETCH_FAILED', err);
  });

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
