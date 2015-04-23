/*jslint es6: false */
'use strict';

// Calculates the hash of the current build
// This file must use ES5 syntax

var hash = 'indeterminate';

try {
  // execSync is only in node 0.12+
  // set a timeout just in case
  var output = require('child_process').execSync('git rev-parse --short HEAD', {
    timeout: 2000 // just in case
  }).toString();

  if (/^[a-f0-9]{7}/.test(output))
    hash = output.substr(0,7);

} catch(e) {
  // execSync may not exist
  console.log('Couldn\'t get commit hash: '+ e);
}

module.exports = hash;
