const { Octokit } = require('@octokit/rest');
const { throttling } = require('@octokit/plugin-throttling');
const { retry } = require('@octokit/plugin-retry');
const organizations = require('../organizations.json');
const cliProgress = require('cli-progress');

//TODO could potentially catch more users by also checking every repository in the orga and checking its contributors
//TODO could potentially catch more orgas by checking all forks/PRs of a user for a repo that belongs to an orga

const MOZILLA_ORGA_FILTER = 'moz';

const BetterOctokit = Octokit.plugin(throttling, retry);
const octokit = new BetterOctokit({
    auth: process.env.GH_TOKEN,
    throttle: {
        onRateLimit(retryAfter, options) {
            console.warn('rate limited!');
            if(options.request.retryCount < 3) {
                return true;
            }
        },
        onAbuseLimit() {
            console.warn('abuse limit reached');
        }
    }
});

async function loadOrganizationMembers(organization) {
    try {
        const users = await octokit.paginate(octokit.orgs.listMembers, {
            org: organization
        });
        return users.map((user) => user.login);
    }
    catch(error) {
        console.log('error loading', organization);
        return [];
    }
}

async function loadUserOrganizations(user) {
    try {
        const orgs = await octokit.paginate(octokit.orgs.listForUser, {
            username: user
        });
        return orgs.map((org) => org.login);
    }
    catch(error) {
        console.log('error loading', user);
        return [];
    }
}

async function getUsersInOrganizations() {
    const allUsers = [];
    const orgaProgress = new cliProgress.SingleBar({
        format: 'organizations [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
    }, cliProgress.Presets.shades_classic);
    orgaProgress.start(organizations.length, 0);
    for(const org of organizations) {
        const members = await loadOrganizationMembers(org);
        orgaProgress.increment();
        allUsers.push(...members);
    }
    orgaProgress.stop();
    const uniqueUsers = new Set(allUsers);

    const allOrganizations = [];
    const userProgress = new cliProgress.SingleBar({
        format: 'users [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
    }, cliProgress.Presets.shades_classic);
    userProgress.start(uniqueUsers.size, 0);
    for(const user of uniqueUsers.values()) {
        const orgs = await loadUserOrganizations(user);
        userProgress.increment();
        allOrganizations.push(...orgs);
    }
    userProgress.stop();
    const uniqueOrganizations = new Set(allOrganizations);

    const eligibleOrganizations = [...uniqueOrganizations.values()].filter((org) => !organizations.includes(org));

    const probableOrganizations = eligibleOrganizations.filter((org) => org.includes(MOZILLA_ORGA_FILTER));
    console.log('found', eligibleOrganizations.length, 'organizations, of which', probableOrganizations.length, 'seem like they could be a mozilla org');
    console.log('potential mozilla orgs:');
    for(const org of probableOrganizations) {
        console.log(org, 'https://github.com/orgs/' + org);
    }
}

getUsersInOrganizations();
