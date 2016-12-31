Mozilla Watcher
=====

This script watches the mozilla GitHub organization and saves the newly discovered repositories.

Setting up the server
-----

First install [Node](http://nodejs.org/) 7 on your server.

Then you can start the server with:

```
$ git clone <URL>
$ npm install
$ npm start
```

Now you can access the website for it at ```localhost:3000```.

Running the fetch script
------

The fetch script should be run regularly to make sure the website always has the latest information.

```
$ npm run fetch
```
