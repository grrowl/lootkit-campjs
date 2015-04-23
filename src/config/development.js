// comet.is application configuration variables

// IMPORTANT: config will be included wholesale in client-side build. Do NOT
// store sensitive data or credentials in here.

var defaultConfig = require('./default.js');

module.exports = defaultConfig.merge({

  env: 'development',

  version: 'dev' // override compiled aseets' version prefix with dev/

});
