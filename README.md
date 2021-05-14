# Mozilla Watcher

This script watches the Mozilla GitHub organizations and saves the newly discovered repositories. It
also saves the newly edited wiki pages.

This repo can be hosted on a static page, all the updating happens through GitHub Actions.

## Fetching data

Then you can start the fetch and build with the following commands. Make sure to replace the placeholders with your data.

```
git clone <URL>
npm ci
GITHUB_TOKEN=<yourGitHubToken> npm start
# After fetching, you can serve the locally generated HTML file
npm run serve
```

The output will be available at http://localhost:5000.

## Branches

* main: business logic and main branch for all code
* update: used to automatically update to the latest data - no changes needed here
* gh-pages: rendered HTML to serve by GitHub Pages

Any push to main will also automatically update the "update" branch through a GitHub Action.
