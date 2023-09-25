import test from 'ava';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Octokit } from '@octokit/action';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

const filePath = fileURLToPath(import.meta.url);
const ORGANIZATIONS = path.resolve(path.dirname(filePath), '../..', 'organizations.json');

const loadFile = (file) => {
    const data = fs.readFileSync(file);
    return JSON.parse(data);
}

test.before((t) => {
    t.context.octokit = new (Octokit.plugin(throttling, retry))({
        throttle: {
            onRateLimit(retryAfter, options) {
                t.log(`rate limited! (for at least ${retryAfter}s)`, retryAfter);
                if(options.request.retryCount < 3) {
                    return true;
                }
            },
            onSecondaryRateLimit() {
                t.log('secondary rate limit reached.', true);
            }
        }
    });
});

const testOrg = test.macro({
    async exec(t, org) {
        t.timeout(10000);
        // Do this one after another to reduce rate limit issues.
        const request = t.context.octokit.orgs.get({ org });
        await t.notThrowsAsync(request);
        const response = await request;
        t.is(response.status, 200);
        t.is(response.data.login.toLowerCase(), org.toLowerCase());
    },
    title(title, org) {
        return `${title}: ${org}`;
    }
});

const organizations = loadFile(ORGANIZATIONS);
for (const org of organizations) {
    test('organizations exist on GitHub', testOrg, org);
}
