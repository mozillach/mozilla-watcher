import Debug from 'debug';
import fs from 'fs';
import path from 'path';
import pug from 'pug';
import { fileURLToPath } from 'url';

import * as storageHandler from '../lib/storage-handler.js';

const debug = new Debug('mozilla-github-watcher:build-index');

const filePath = fileURLToPath(import.meta.url);
const indexPugPath = path.resolve(path.dirname(filePath), '..', 'index.pug');
const indexFilePath = path.resolve(path.dirname(filePath), '..', 'public', 'index.html');

debug('Getting data...')
const repos = storageHandler.getRepos();
const wikiEdits = storageHandler.getWikiEdits();

debug('Rendering HTML...')
const html = pug.renderFile(indexPugPath, {
  repos,
  wikiEdits,
});

debug('Writing HTML...')
fs.writeFileSync(indexFilePath, html);
