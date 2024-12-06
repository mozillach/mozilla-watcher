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

The output will be available at http://localhost:3000.
