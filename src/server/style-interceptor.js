'use strict';

// Intercepts styles which attempt to load in a server environment and stores
// them for later use
// Inpsired by <https://github.com/webpack/react-webpack-server-side-example/blob/master/server/style-collector.js>

var styleInterceptor = function () {};

// mock add function. does nothing outside of intercept()
styleInterceptor.add = function () {};

styleInterceptor.intercept = function (callback, recordsMap) {
  var styleList = [],
      originalAdd = styleInterceptor.add;

  // we'll actually intercept the styles now
  styleInterceptor.add = function (style, filename) {
    // Expects output direct from css-loader (in [id, string] format)
    for (let i = 0; i < style.length; i++) {
      styleList.push(style[i][1]);
    }
  };

  callback();

  // restore mock function
  styleInterceptor.add = originalAdd;

  return styleList.join('\n');
};

export default styleInterceptor;
