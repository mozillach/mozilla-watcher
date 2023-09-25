import cliProgress from 'cli-progress';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

import { readJSON } from './utils.js';

const organizations = await readJSON('../organizations.json');

//TODO could potentially catch more orgas by checking all PRs of a user for a repo that belongs to an orga

const MOZILLA_ORGA_FILTER = 'moz';
const DEEP_SEARCH = /true/i.test(process.env.DEEP_SEARCH);
const CACHE_REPOS = DEEP_SEARCH && /true/i.test(process.env.CACHE_REPOS);
const PAD_SIZE = DEEP_SEARCH ? 30 : 13;
const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;
let status = '';
let currentBar;
let rateLimitTimer;
const knownRepoNames = new Set();
if(CACHE_REPOS) {
    try {
        const previousRuns = require('../repos.json');
        console.log('Warming up repo cache with', previousRuns.length, 'repos');
        for(const repo of previousRuns) {
            knownRepoNames.add(repo);
        }
    } catch {
        console.log('No repo cache found.');
    }
}

const BetterOctokit = Octokit.plugin(throttling, retry);
const octokit = new BetterOctokit({
    auth: process.env.GH_TOKEN,
    userAgent: 'moz watcher crawler',
    throttle: {
        onRateLimit(retryAfter, options) {
            setStatus(`rate limited! (for at least ${retryAfter}s)`, retryAfter);
            if(options.request.retryCount < 3) {
                return true;
            }
        },
        onSecondaryRateLimit() {
            setStatus('secondary rate limit reached.', true);
        }
    }
});
octokit.hook.before('request', () => {
    if(rateLimitTimer) {
        setStatus();
    }
    else if(currentBar) {
        // Update ETA for paginating requests.
        currentBar.updateETA();
    }
});

function setStatus(newStatus = '', rateLimitRetry = 0) {
    status = newStatus;
    if(rateLimitTimer) {
        if(rateLimitTimer !== true) {
            clearInterval(rateLimitTimer);
        }
        rateLimitTimer = undefined;
    }
    if(rateLimitRetry === true) {
        rateLimitTimer = true;
    }
    if(rateLimitRetry > 0) {
        const start = Date.now();
        rateLimitTimer = setInterval(() => {
            const diff = Math.floor((Date.now() - start) / 1000);
            status = `rate limited! (for at least ${rateLimitRetry - diff}s)`;
            if(currentBar) {
                currentBar.update({ status });
            }
        }, 1000);
    }
    if(currentBar) {
        currentBar.update({ status });
    }
}

async function loadOrganizationMembers(organization) {
    try {
        const users = await octokit.paginate(octokit.orgs.listMembers, {
            org: organization
        });
        return users.map((user) => user.login);
    }
    catch(error) {
        setStatus(`error loading ${organization}`);
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
        setStatus(`error loading ${user}`);
        return [];
    }
}

async function loadOrganizationRepos(organization) {
    try {
        const repos = await octokit.paginate(octokit.repos.listForOrg, {
            org: organization,
            type: 'sources',
        });
        return repos
            .filter((repo) => !repo.archived && !repo.private && !repo.fork && repo.pushed_at)
            .map((repo) => repo.name);
    }
    catch(error) {
        setStatus(`error loading repositories for ${organization}`);
        return [];
    }
}

async function loadRepositoryCollaborators(owner, repository) {
    try {
        const contributions = await octokit.paginate(octokit.repos.getContributorsStats, {
            owner,
            repo: repository,
        });
        return contributions
            .filter((contribution) => !!contribution.author)
            .map((contribution) => contribution.author.login);
    }
    catch(error) {
        // Probably an empty repo where octokit's pagination errored.
        return [];
    }
}

async function loadUserRepos(user, ignoredRepos) {
    try {
        const repos = await octokit.paginate(octokit.repos.listForUser, {
            username: user,
            type: 'all',
        });
        return repos
            .filter((repo) => !repo.archived && !repo.private && !ignoredRepos.has(repo.name) && repo.pushed_at && (Date.now() - new Date(repo.pushed_at).getTime() < ONE_YEAR || !repo.fork) && (repo.fork || (repo.owner.login !== user && repo.owner.type === 'Organization')));
    }
    catch(error) {
        setStatus(`error loading fork sources and owners of contributions for ${user}`);
        return [];
    }
}

function padTitle(title) {
    const paddedTitle = title.padEnd(PAD_SIZE, ' ');
    if(paddedTitle.length > PAD_SIZE) {
        return paddedTitle.slice(0, PAD_SIZE - 1) + '…';
    }
    return paddedTitle;
}

function writeRepoCache() {
    if(!CACHE_REPOS) {
        return;
    }
    const repos = [...knownRepoNames.values()];
    return fs.promises.writeFile(path.join(__dirname, '../repos.json'), JSON.stringify(repos));
}

async function getUsersInOrganizations() {
    if(DEEP_SEARCH) {
        console.warn("WARNING: running deep search. You will likely hit the rate limit multiple times.");
    }


    const allUsers = [];
    const orgaProgress = new cliProgress.SingleBar({
        format: `${padTitle('organizations')} [{bar}] {percentage}% | ETA: {eta_formatted} | {value}/{total} | {status}`,
        autopadding: true,
        etaBuffer: 1000,
    }, cliProgress.Presets.shades_classic);
    currentBar = orgaProgress;
    orgaProgress.start(organizations.length, 0, { status });
    for(const org of organizations) {
        const members = await loadOrganizationMembers(org);
        orgaProgress.increment({ status });
        allUsers.push(...members);
    }
    orgaProgress.stop();
    currentBar = undefined;
    setStatus();

    if(DEEP_SEARCH) {
        const orgaRepoProgress = new cliProgress.MultiBar({
            format: '{title} [{bar}] {percentage}% | ETA: {eta_formatted} | {value}/{total} | {status}',
            autopadding: true,
            etaBuffer: 5000,
        }, cliProgress.Presets.shades_classic);
        const orgSubProgress = orgaRepoProgress.create(organizations.length, 0, { title: padTitle('repos'), status });
        for(const org of organizations) {
            currentBar = orgSubProgress;
            const repos = await loadOrganizationRepos(org);
            currentBar = undefined;
            setStatus();
            const reposSubProgress = orgaRepoProgress.create(repos.length, 0, { title: padTitle(`repos of ${org}`), status: '' });
            currentBar = reposSubProgress;
            for(const repo of repos) {
                knownRepoNames.add(repo);
                const collaborators = await loadRepositoryCollaborators(org, repo);
                reposSubProgress.increment({ status });
                orgSubProgress.updateETA();
                allUsers.push(...collaborators);
            }
            orgaRepoProgress.remove(reposSubProgress);
            orgSubProgress.increment();
            orgSubProgress.updateETA();
        }
        orgaRepoProgress.stop();
        currentBar = undefined;
        setStatus();
        await writeRepoCache();
    }
    const uniqueUsers = new Set(allUsers);

    const allOrganizations = [];
    const userProgress = new cliProgress.MultiBar({
        format: '{title} [{bar}] {percentage}% | ETA: {eta_formatted} | {value}/{total} | {status}',
        autopadding: true,
        etaBuffer: 500000,
    }, cliProgress.Presets.shades_classic);
    const userSubProgress = userProgress.create(uniqueUsers.size, 0, { title: padTitle('users'), status: '' });
    for(const user of uniqueUsers.values()) {
        currentBar = userSubProgress;
        const orgs = await loadUserOrganizations(user);
        allOrganizations.push(...orgs);
        if(DEEP_SEARCH) {
            const userRepos = await loadUserRepos(user, knownRepoNames);
            if(userRepos.length > 0) {
                currentBar = undefined;
                setStatus();
                const subProgress = userProgress.create(userRepos.length, 0, { title: padTitle(`repos of ${user}`), status });
                currentBar = subProgress;
                for (const repo of userRepos) {
                    knownRepoNames.add(repo.name);
                    // checking forks will end up doing way too many requests which takes _forever_
                    // if(CACHE_REPOS && repo.fork && (repo.owner.login === user || repo.owner.type !== 'Organization')) {
                    //     try {
                    //         const { data: repoInfo } = await octokit.repos.get({
                    //             owner: repo.owner.login,
                    //             repo: repo.name,
                    //         });
                    //         const { owner } = repoInfo.source || repoInfo.parent;
                    //         if (owner.type === 'Organization') {
                    //             allOrganizations.push(owner.login);
                    //         }
                    //         userSubProgress.updateETA();
                    //     }
                    //     catch(error) {
                    //         // Ignore DMCAd repos
                    //         if(error.status !== 451) {
                    //             setStatus(`error loading repo details for ${user}/${repo.name}`);
                    //         }
                    //         userSubProgress.updateETA();
                    //         continue;
                    //     }
                    // }
                    if(repo.owner.type === 'Organization') {
                        allOrganizations.push(repo.owner.login);
                    }
                    subProgress.increment({ status });
                }
                userProgress.remove(subProgress);
            }
        }
        userSubProgress.increment({ status });
    }
    userProgress.stop();
    await writeRepoCache();
    const uniqueOrganizations = new Set(allOrganizations);

    //TODO should filter by normalized organization names
    const eligibleOrganizations = [...uniqueOrganizations.values()].filter((org) => !organizations.includes(org));

    const probableOrganizations = eligibleOrganizations.filter(isMozillaOrgName);
    console.log('found', eligibleOrganizations.length, 'organizations, of which', probableOrganizations.length, 'seem like they could be a mozilla org');
    console.log('potential mozilla orgs:');
    for(const org of probableOrganizations) {
        console.log(org, 'https://github.com/orgs/' + org);
    }
}

function isMozillaOrgName(organization) {
    const normalizedOrganization = organization.toLowerCase();
    return normalizedOrganization.includes(MOZILLA_ORGA_FILTER) || normalizedOrganization.includes('firefox');
}

getUsersInOrganizations()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
