'use strict';

import _ from 'lodash';
import React from 'react';
import Router from 'react-router';

import config from 'config';

// (dev) hot module replacement is available for routes.jsx by implementing:
// <https://github.com/rackt/react-router/pull/606#issuecomment-66936975>
import routes from 'routes';

function startClient() {
  var contentDiv = document.getElementById('react-content'),
      stylesTag = document.getElementById('preloaded-css'),
      dataStateDiv = document.getElementById('react-dataState'),
      dataState = {};

  // Abort if our render target doesn't exist at all
  if (!contentDiv) {
    throw new Error("Couldn't find #react-content div");
  }

  // Prepare the preloaded data state
  if (dataStateDiv) {
    try {
      dataState = JSON.parse(_.unescape(dataStateDiv.innerHTML));
    } catch (err) {
      console.warn('Couldn\'t parse dataState', err);
    }
  }

  // Allows React to listen for onTouchStart etc. events
  React.initializeTouchEvents(true);

  Router.run(routes, Router.HistoryLocation, function (Handler, state) {
    React.render(<Handler {...dataState}/>, contentDiv, function () {
      if (config.features.preloadedRemoval) {
        // when render completes, clean up temporary elements
        if (stylesTag) {
          stylesTag.parentNode.removeChild(stylesTag);
          stylesTag = undefined; // remove reference
        }
        if (dataStateDiv) {
          dataStateDiv.parentNode.removeChild(dataStateDiv);
          dataStateDiv = undefined; // remove reference
        }
      }
    });
  });
}

// in-browser bootstrapping
if (typeof window !== 'undefined') {

  if (typeof document.addEventListener === 'function') {
    // IE9+, Firefox1+, Chrome1+, Opera7+
    document.addEventListener('DOMContentLoaded', startClient);

  } else {
    // IE8 or below, browser not supported
    // This could alternatively be a server-rendered page within your browser
    // (rendered with skipClient = true in document.jsx)
    window.location = 'https://browser-update.org/update.html';
  }

}

module.exports.routes = routes;
