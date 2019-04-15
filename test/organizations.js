import test from 'ava';
import fs from 'fs';
import util from 'util';
import path from 'path';
// import fetch from 'node-fetch';

const ORGANIZATIONS = path.resolve(__dirname, '..', 'organizations.json');

const loadFile = async (file) => {
    const data = await util.promisify(fs.readFile)(file, { encoding: 'utf-8' });
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

// test('organizations exist on GitHub', async (t) => {
//     const organizations = await loadFile(ORGANIZATIONS);
//     // Do this one after another to reduce rate limit issues.
//     for(const org of organizations) {
//         const request = await fetch(`https://api.github.com/orgs/${org}`);
//         t.true(request.ok);
//         t.is(request.status, 200);
//         const json = await request.json();
//         t.is(json.login.toLowerCase(), org.toLowerCase());
//         if(parseInt(request.headers.get('X-RateLimit-Remaining'), 10) <= 1) {
//             const timeToReset = parseInt(request.headers.get('X-RateLimit-Reset'), 10) * 1000 - Date.now();
//             await new Promise((resolve) => setTimeout(resolve, timeToReset));
//         }
//     }
// });
