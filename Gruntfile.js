/*jslint es6: false */
'use strict';

// grunt tasks
// This file must use ES5 syntax

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

  // where cacheable assets compile to
  var publicDir = webpackConfig(['client']).output.path;

  // What port the hotserver runs on
  var hotServerPort = webpackConfig.hotServerPort;

  // Load all available grunt- npm tasks
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    // Webpack task to compile assets to dist/
    webpack: {
      options: {},
      'client-dev-hot': webpackConfig(['client', 'dev', 'hot']),
      'client-dev': webpackConfig(['client', 'dev']),
      'client-prod': webpackConfig(['client', 'prod']),
      'server-dev': webpackConfig(['server', 'dev']),
      'server-prod': webpackConfig(['server', 'prod'])
    },

    // Connect serves files from dist/ and (on dev) client files from memory
    connect: {
      options: {
        hostname: '*',
        debug: false,
        port: defaultConfig.server.port,
        stuff: (function () {
          console.log('default config port : ' + defaultConfig.server)
          console.log('default config env : ' + process.env['PORT']);
          return null;
        })(),

        // defaultMiddleware is not a connect option -- we use it to inherit
        // no matter the envionment
        defaultMiddlewares: function (connect, options, middlewares) {
          // default middlewares are [serveStatic, serveIndex], we define our
          // own strict ordered stackrendering
          middlewares = [

            compression(),

            cookieParser(),

            // handles existing files within public/ directory
            require('serve-static')(publicDir),

            // server-side rendering of the application
            (function (req, res, next) {
              // must require "server.js" each time so cache invalidation works
              // (servercache:reset task)
              var server = require(path.resolve(distributableDir, 'server.js'));

              return server.middleware(req, res, next);
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

            middlewares.unshift(options.devMiddleware(['client', 'dev']));

            return middlewares;
          }
        }
      },
      'dev-hot': {
        options: {
          middleware: function(connect, options, middlewares) {
            // Get default middlewares, unshift devMiddleware onto the start

            middlewares = options.defaultMiddlewares(connect, options, middlewares);

            middlewares.unshift(options.devMiddleware(['client', 'dev', 'hot']));

            return middlewares;
          }
        }
      },
      prod: {
        options: {}
      }
    },

    // Delete files within distributableDir when about to compile
    clean: [distributableDir],

    // Copy static files from src/static to dist/
    copy: {
      static: {
        files: [
          {
            expand: true,
            cwd: path.resolve(sourceDir, 'static'),
            src: ['**'],
            dest: publicDir
          }
        ]
      }
    },

    // Runs multiple watchers at once
    focus: {
      dev: {
        // watch source and compiled output
        include: ['static', 'source', 'compiled']
      },
      prod: {
        // only watch for server.js updates
        include: ['compiled']
      }
    },

    // Server-side rendering requires that all jsx is compiled; so, this runs
    // no matter the environment -- just the options its compiled with change
    watch: {
      static: {
        files: path.resolve(sourceDir, 'static', '*'),
        tasks: ['copy:static'],
      },
      source: {
        files: [path.join(sourceDir, '**')],
        tasks: ['concurrent:compile-dev'],
      },
      compiled: {
        // watch for changes to the server runtime, then invalidate the cache
        files: [path.join(distributableDir, 'server.js')],
        tasks: ['servercache:reset'],
        options: {
          spawn: false,
          // debounceDelay: 1
        }
      }
    },

    // Tasks for compiling the app concurrently (output may be a bit messy)
    concurrent: {
      'compile-dev-hot': {
        tasks: ['webpack:server-dev'], // server only, client is served by dev-middleware
        options: {logConcurrentOutput: true}
      },
      'compile-dev': {
        tasks: ['webpack:server-dev'], // server only, client is served by dev-middleware
        options: {logConcurrentOutput: true}
      },
      'compile-prod': {
        tasks: ['webpack:server-prod', 'webpack:client-prod'],
        options: {logConcurrentOutput: true}
      }
    }
  });

  // Reset the require cache for the server runtime
  grunt.registerTask('servercache:reset', function () {
    // must match the path.resolve call for connect, above.
    delete require.cache[path.resolve(distributableDir, 'server.js')];
  });

  // Run the webpack Hot Module Replacement server
  grunt.registerTask('hotserver:dev', function () {
    var WebpackDevServer = require('webpack-dev-server'),
      config = webpackConfig(['client', 'dev', 'hot']),
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

  grunt.registerTask('prepare:dist', function () {
    grunt.task.run([
      'clean',
      'copy:static'
    ]);
  });

  grunt.registerTask('server:dev', function () {
    grunt.task.run([
      'prepare:dist',
      'sourcemaps:install',
      'concurrent:compile-dev', // must be compiled to js so server can render
      'connect:dev', // initially run server
      'focus:dev'
    ]);
  });

  grunt.registerTask('server:dev-hot', function () {
    grunt.task.run([
      'prepare:dist',
      'sourcemaps:install',
      'concurrent:compile-dev-hot', // must be compiled to js so server can render
      'hotserver:dev', // serves HMR assets for client
      'connect:dev-hot', // start server
      'focus:dev'
    ]);
  });

  grunt.registerTask('server:prod', function () {
    grunt.task.run([
      'prepare:dist',
      'concurrent:compile-prod',
      'connect:prod', // start server
      'focus:prod'
    ]);
  });

  grunt.registerTask('serve', function () {
    grunt.task.run([
      'connect:prod:keepalive',
    ]);
  });

  grunt.registerTask('build:prod', function () {
    grunt.task.run([
      'prepare:dist',
      'concurrent:compile-prod',
    ]);
  });

  grunt.registerTask('build:dev', function () {
    grunt.task.run([
      'prepare:dist',
      'concurrent:compile-dev',
    ]);
  });

  grunt.registerTask('default', function () {
    grunt.task.run([
      'build:prod'
    ]);
  });

  grunt.registerTask('heroku:dev', 'build:prod');

};
