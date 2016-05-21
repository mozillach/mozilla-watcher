Mozilla GitHub Watcher
=====

This script watches the mozilla.org GitHub organization and saves the newly discovered repositories to a Redis instance.

Further there is a website to initialize a Service Worker to send the Push Notifications for new repositories discovered.

Website
-----

Check this out at ....

Setting up the server
-----

First install [Redis](http://redis.io/) and [Node](http://nodejs.org/) on your server.

Then you can run the server side script with

```
$ git clone <URL>
$ npm install
$ npm start
```

You could also use forever or similar tools to keep the server restarting after errors.

Setting up the website
------

There is nothing to do, you just need a local server serving the index.html.

```
$ python -m SimpleHTTPServer
```

Now the index.html should be served on ```localhost:8000```.
