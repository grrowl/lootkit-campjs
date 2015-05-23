/*jslint es6: false */
'use strict';

// comet webpack config
// Each build takes `baseConfig` and layers each specified environment config on itself
// This file must use ES5 syntax

var webpack = require('webpack'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

var StatsPlugin = require('stats-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin");

// Config (includes version, links)

var appConfig = (function (env) {
  var config;

  // Load config/NODE_ENV.js, or default.js
  if (fs.existsSync('./src/config/'+ env +'.js')) {
    config = require('./src/config/'+ env +'.js');
  } else {
    config = require('./src/config/default.js');
  }

  // if local.js exists, merge it onto the above config
  if (fs.existsSync('./src/config/local.js')) {
    config = config.merge(require('./src/config/local.js'));
  }

  return config;
})(process.env['NODE_ENV']);


// Global webpack settings

var inputPath = path.join(__dirname, 'src'),
    outputPath = path.join(__dirname, 'dist');

var hotServerPort = 8001;

var baseConfig = {
  debug: false,

  entry: {
    client: 'client.jsx'
  },
  output: {
    path: outputPath,
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },

  recordsPath: path.resolve(outputPath, './webpack.records.json'),
  // profile: true, // collect timing profile information and stats
  quiet: true,
  stats: {
    colors: true,
    modules: false,
    reasons: false
  },

  module: {
    preLoaders: [
      // style transformation loaders here -- environment-specific loaders
      // (style-loader and style-interceptor) are applied in build-specific loaders below.
      // this way, we can override the loader within the app at require()-level
      {
        test: /\.s?css$/,
        loaders: [
          'css',
          'sass?includePaths[]='+ path.resolve(__dirname, 'node_modules') +
            '&includePaths[]='+ path.resolve(__dirname, 'bower_components')
        ]
      }
    ],
    loaders: [
      {
        test: /\.html$/,
        loaders: ['file?name=[name].[ext]']
      },
      {
        test: /(\.jpg|\.jpeg|\.png|\.gif|\.eot|\.svg|\.woff|\.ttf)$/,
        loaders: ['file?name=assets/[name].[hash].[ext]']
      },

      // Styles
      {
        test: /\.s?css$/,
        exclude: /app\.scss$/,
        loaders: ['style']
      },
      {
        // Write app.scss to a file specifically
        test: /app\.scss$/,
        loaders: [ExtractTextPlugin.loader()]
      },

      // [6to5.bluebirdCoroutines](https://6to5.org/docs/usage/transformers/#bluebird-coroutines)
      // [Bluebird.coroutine](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisecoroutinegeneratorfunction-generatorfunction---function)
      { test: /\.js$/, loaders: ['babel?optional=bluebirdCoroutines'], exclude: [/node_modules/, /bower_components/] },
      { test: /\.jsx$/, loaders: ['babel?optional=bluebirdCoroutines'] },

      // enable require('...package.json') for superagent et al
      { test: /\.json$/, loaders: ['json'] },

      // enable React devtools
      { test: /[\/]react.*\.js$/, loaders: ['expose?React'] }
    ],
    postLoaders: [
      {
        // break any file ending in "route.jsx" into its own bundle
        test: /route\.jsx$/,
        // exclude views you want included in the initial chunk
        // app.scss must be required in the initial chunk somewhere
        // for style interception to work reliably
        exclude: /approute\.jsx$/,
        loaders: ['react-router-proxy']
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: path.join(inputPath),
    modulesDirectories: ['bower_components', 'node_modules'],
    alias: {}
  },
  externals: {},
  plugins: [
    new ExtractTextPlugin(appConfig.version +'/app.css'),
    new webpack.DefinePlugin({
      'typeof window': JSON.stringify("object")
    }),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
    ),
    new webpack.DefinePlugin({
      // baked-in configuration variables. must be stringified for DefinePlugin
      'BUILD_ENV': JSON.stringify(appConfig)
    }),
    new webpack.NoErrorsPlugin()
  ]
};

// Environment- and build-specific settings
// Not only "prod" and "dev", "client" and "server" have differing build configs
// This will be *shallow copied* onto config. Take care if you're overwriting keys.
var envConfig = {

  // development environment
  dev: function (config) {
    return {
      debug: true,
      devtool: 'inline-source-map',

      output: _.assign({}, config.output, {
        // Verbose comments on requires: `require(/* ./test */23)`
        pathinfo: true
      }),

      plugins: config.plugins.concat([
        new webpack.DefinePlugin({
          'process.env': {
            // This affects the react lib size
            'NODE_ENV': JSON.stringify('development')
          }
        })
      ])
    };
  },

  // production environment
  prod: function (config) {
    return {
      plugins: config.plugins.concat([
        new webpack.DefinePlugin({
          'process.env': {
            // This affects the react lib size
            'NODE_ENV': JSON.stringify('production')
          }
        }),

        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
      ])
    };
  },

  hot: function (config) {
    return {
      // Add hot module replacement wrapper around .jsx files
      module: {
        preLoaders: config.module.preLoaders,
        loaders: config.module.loaders,
        postLoaders: (config.module.postLoaders || []).concat([
          // don't wrap entry module client.jsx or top-level approute, or
          // dependencies (styles) will break!
          {
            test: /route\.jsx?$/,
            exclude: /(client|approute)\.jsx$/,
            loaders: ['react-hot']
          }
        ])
      },

      // add HMR assets to bundle if client build
      entry: (
        config.entry.client ? {
          client: [
            // must match port in hotserver:dev grunt task
            'webpack-dev-server/client?http://localhost:'+ hotServerPort,
            'webpack/hot/only-dev-server',
            'client.jsx'
          ]
        } : config.entry
      ),
      plugins: config.plugins.concat([
        new webpack.HotModuleReplacementPlugin()
      ])
    };
  }
};


// called as require('webpack.config')('prod')
// or require('webpack.config')(['server', 'prod'])

module.exports = function (environments) {
  environments = environments || [];
  var config;

  config = _.reduce(environments, function (accConfig, env) {
    return _.assign({}, accConfig, envConfig[env](accConfig));
  }, baseConfig);

  // output a stats timing file for analysis by <http://webpack.github.io/analyse/>
  if (config.profile && typeof _.isObject(config.entry)) {
    config.plugins = config.plugins.concat(
      new StatsPlugin(path.resolve(outputPath, _.keys(config.entry)[0] +'.stats.json'), {
        chunkModules: true,
        // exclude large modules which add noise to the stats
        exclude: path.join('node_modules', 'react')
      })
    );
  }

  return config;
};

module.exports['inputPath'] = inputPath;
module.exports['outputPath'] = outputPath;
module.exports['hotServerPort'] = hotServerPort;
