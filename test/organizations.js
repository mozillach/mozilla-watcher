import test from 'ava';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

const filePath = fileURLToPath(import.meta.url);
const ORGANIZATIONS = path.resolve(path.dirname(filePath), '..', 'organizations.json');

const loadFile = async (file) => {
    const data = await util.promisify(fs.readFile)(file);
    return JSON.parse(data);
}

test('organizations.json is valid json', (t) => {
    return t.notThrowsAsync(() => loadFile(ORGANIZATIONS));
});

test('check for duplicate organizations', async (t) => {
    const organizations = await loadFile(ORGANIZATIONS);
    const dedupedOrganizations = new Set(organizations.map((o) => o.toLowerCase()));
    t.is(organizations.length, dedupedOrganizations.size);
});

test('check organizations to be valid logins', async (t) => {
    const organizations = await loadFile(ORGANIZATIONS);
    for(const org of organizations) {
        t.not(org.search(/^[0-9a-zA-Z_-]+$/), -1);
    }
});
