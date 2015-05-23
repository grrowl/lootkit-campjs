/*jslint es6: false */
'use strict';

// grunt tasks
// This file must use ES5 syntax

var storage = [];

module.exports = function (grunt) {

  var _ = require('lodash'),
    webpack = require('webpack'),
    webpackMiddleware = require('webpack-dev-middleware'),
    webpackConfig = require('./webpack.config.js'),
    // in Gruntfile context, config will NOT have any BUILD_ENV variables defined
    defaultConfig = require('./src/config/default.js'),
    url = require('url'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    path = require('path');

  // where source assets live
  var sourceDir = path.join(__dirname, 'src');

  // where cacheable assets compile to
  var distributableDir = webpackConfig().output.path;

  // What port the hotserver runs on
  var hotServerPort = webpackConfig.hotServerPort;

  // Load all available grunt- npm tasks
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    // Webpack task to compile assets to dist/
    webpack: {
      options: {},
      'client-dev-hot': webpackConfig(['dev', 'hot']),
      'client-dev': webpackConfig(['dev']),
      'client-prod': webpackConfig(['prod'])
    },

    // Connect serves files from dist/ and (on dev) client files from memory
    connect: {
      options: {
        hostname: '*',
        debug: false,
        port: defaultConfig.server.port,

        // defaultMiddleware is not a connect option -- we use it to inherit
        // no matter the envionment
        defaultMiddlewares: function (connect, options, middlewares) {
          // default middlewares are [serveStatic, serveIndex], we define our
          // own strict ordered stackrendering
          middlewares = [

            compression(),

            // rewrite the single-page-app urls
            (function (req, res, next) {
              console.log('rewrite?', req.url);
              req.url.replace(/^\/(map|list)/, '/index.html');
              next();
            }),

            // handles existing files within public/ directory
            require('serve-static')(distributableDir),

            // --- this is about the part we become a server api ---

            // parse the body of the request probably
            require('body-parser').json(),

            // server API
            (function (req, res, next) {
              if (req.url !== '/%22db%22') {
                next();
                return;
              }

              console.log('accessing db, '+ storage.length +' boop beep boop...');

              switch(req.method) {
                case 'GET':
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(storage, null, 2));
                  break;

                case 'PUT':
                  if (typeof req.body !== 'object') {
                    // this is terrible
                    console.log("BAD JSON DETECTED", req.body);
                    break;
                  }

                  var lastId = -1;
                  for (var i in storage) {
                    if (storage._id > lastId)
                      lastId = storage._id + 1;
                  }

                  for (var i in req.body) {
                    req.body[i]._id = lastId++;
                    storage.push(req.body[i]);
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(req.body, null, 2));
                  break;

                default:
                  res.end('unknown method');
              }

              next();
            })
          ];

          return middlewares;
        },

        // base config for dev middleware
        // middleware is singular and plural. oy vey.
        devMiddleware: function (configEnvironments) {
          var config = webpackConfig(configEnvironments);

          // serve webpack in-memory compiled assets onto the start of the
          // stack, before static file handlers
          return webpackMiddleware(
            webpack(config), {
              // filename should NOT be required! see:
              // <https://github.com/webpack/webpack-dev-middleware/issues/25>
              filename: 'client.js',
              publicPath: config.output.publicPath,
              headers: { "X-Server": "webpack-dev-middleware" },
              stats: { colors: true }
            });
        },

        // apply the above default middleware
        middleware: function (connect, options, middlewares) {
          return options.defaultMiddlewares(connect, options, middlewares);
        }
      },
      dev: {
        options: {
          middleware: function(connect, options, middlewares) {
            // Get default middlewares, unshift devMiddleware onto the start

            middlewares = options.defaultMiddlewares(connect, options, middlewares);

            middlewares.unshift(options.devMiddleware(['dev']));

            return middlewares;
          }
        }
      },
      'dev-hot': {
        options: {
          middleware: function(connect, options, middlewares) {
            // Get default middlewares, unshift devMiddleware onto the start

            middlewares = options.defaultMiddlewares(connect, options, middlewares);

            middlewares.unshift(options.devMiddleware(['dev', 'hot']));

            return middlewares;
          }
        }
      },
      prod: {
        options: {}
      }
    },

    // Server-side rendering requires that all jsx is compiled; so, this runs
    // no matter the environment -- just the options its compiled with change
    watch: {
      source: {
        files: [path.join(sourceDir, '**')],
        tasks: ['webpack:compile-dev']
      }
    }

  });

  // Run the webpack Hot Module Replacement server
  grunt.registerTask('hotserver:dev', function () {
    var WebpackDevServer = require('webpack-dev-server'),
      config = webpackConfig(['dev', 'hot']),
      host = '0.0.0.0',
      port = hotServerPort;

    new WebpackDevServer(webpack(config), {
      publicPath: config.output.publicPath,
      hot: true,
      noInfo: true,
      stats: {colors: true}
    }).listen(port, host, function (err, result) {
        if (err)
          console.warn('Hot server error: ' + err);

        console.log('Hot server listening at ' + host + ':' + port);
      });
  });

  // Add source map support (only applies to dev builds)
  grunt.registerTask('sourcemaps:install', function () {
    // require source-map-support so errors in the compiled server.jsx spits out
    // the /actual/ error location.
    require('source-map-support').install();
  });

  grunt.registerTask('server:dev-hot', function () {
    grunt.task.run([
      'sourcemaps:install',
      'hotserver:dev', // serves HMR assets for client
      'connect:dev-hot', // start server
      'watch:source'
    ]);
  });

  grunt.registerTask('server:dev', function () {
    grunt.task.run([
      'sourcemaps:install',
      'connect:dev', // initially run server
      'watch:source'
    ]);
  });

  grunt.registerTask('server:prod', function () {
    grunt.task.run([
      'webpack:client-prod',
      'connect:prod:keepalive' // start server
    ]);
  });

  grunt.registerTask('serve', function () {
    grunt.task.run([
      'connect:prod:keepalive'
    ]);
  });

  grunt.registerTask('build:prod', function () {
    grunt.task.run([
      'webpack:client-prod'
    ]);
  });

  grunt.registerTask('build:dev', function () {
    grunt.task.run([
      'webpack:client-dev'
    ]);
  });

  grunt.registerTask('default', function () {
    grunt.task.run([
      'build:prod'
    ]);
  });

  grunt.registerTask('build:prod');

};
