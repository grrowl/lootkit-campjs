// comet.is application configuration variables

// IMPORTANT: config will be included wholesale in client-side build. Do NOT
// store sensitive data or credentials in here.

// local.js' exports only need to be a plain object. it will automatically
// inherit from the appropriate config

module.exports = {

  server: {
    port: 9000,
    hostname: 'localhost'
  },

  cookies: {
    expires: 365 * 24 * 3600,
    path: '/',
    domain: 'localhost'
  },

};
