/*jslint es6: false */
'use strict';

// comet.is application configuration variables
// This file must use ES5 syntax

// IMPORTANT: config will be included wholesale in client-side build. Do NOT
// store sensitive data or credentials in here.

var _ = require('lodash'),
  version = require('./../server/gitversion');

var defaultConfig = {
  version: version, // application version
  env: process.env['NODE_ENV'], // runtime environment

  // server.jsx configuration
  server: {
    port: process.env['PORT'] || 9000,
    hostname: process.env['APP_SERVER']
  },

  // Cookie configuration
  cookies: {
    // the cookies object may get passed directly into client- and server-side
    // cookies libraries, so balance the structure accordingly
    // * client: [cookies-js](https://github.com/ScottHamper/Cookies#cookiessetkey-value--options)
    // * server: [cookies](https://github.com/pillarjs/cookies#cookiesset-name--value---options--)

    // cookies are only *set* on the client, so this will represent expiry date
    // relative to the time it was set.
    // The server-side cookie library accepts an absolute date so it shouldn't
    // use config.cookies.expires.
    expires: 365 * 24 * 3600, // 1 year away (client only)
    path: '/',
    domain: '.example.com'
  },

  // Features to be turned on and off if neccessary
  features: {
    // `preloadedRemoval` removes #preloaded-css and #react-dataState from the
    // DOM once the initial render completes.
    // DEFAULT FALSE: may cause FOUC during setup with lazily bundled styles
    preloadedRemoval: false
  }
};

// Config merging function
// call config.mergeConfig({ debug: true }) => new config
// is chainable
defaultConfig.merge = function (obj) {
  return _.merge(this, obj);
};

module.exports = defaultConfig;
