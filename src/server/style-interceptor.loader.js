/*jslint es6: false */
'use strict';

// Rewrites require statements to direct to style-interceptor
// This file must use ES5 syntax

module.exports = function () {};
module.exports.pitch = function (requiredFile) {
  this.cacheable && this.cacheable();
  return 'require(' + JSON.stringify(require.resolve("./style-interceptor")) +')'+
    '.add(require(' + JSON.stringify('!!' + requiredFile) + '), '+ JSON.stringify(requiredFile) +')'+
    ';\n'+
    'delete require.cache[module.id];';
}
