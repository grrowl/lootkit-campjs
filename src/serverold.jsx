'use strict';

// Server application

// React and page routing
import _ from 'lodash';
import React from 'react';
import Router from 'react-router';
import Promise from 'bluebird';
import config from 'config';

import ServerError from 'errors/servererror';

import Document from 'server/document';
import ServerErrorView from 'server/errorview';
import routes from 'routes';

import styleInterceptor from 'server/style-interceptor';

// filter any matches routes with fetchData static functions (which should
// return a promise), then reduce these to a object keyed by route name
// which resolves when all promises either fulfil or fail
function preloadData(routes, params, cookies) {

  var data = {};

  // Collect data from route fetchData calls
  return Promise.settle(
    routes.filter(
      route => typeof route.handler.fetchData === 'function'
    ).map(route => {
      // map fetchDatas to promises, but store the { route: result } in a map for later
      return route.handler.fetchData(params).then(res => {
        data[route.name] = res;
      });
    })

  // when all promises finish, return the map
  // remember .settle() is extremely tolerant. thrown errors will not be exposed
  ).then(() => data);
}

// From <http://stackoverflow.com/a/23329386/894361>
function stringLengthInBytes(str) {
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}

function _renderServerError(e, req, res, next) {
  // Render a ServerError view.

  var innerHtml;
  var css = styleInterceptor.intercept(() => {
    innerHtml = React.renderToString(
      React.createElement(ServerErrorView, {
        message: e,
        version: config.version
      })
    );
  });

  var page = '<!DOCTYPE html>' + React.renderToStaticMarkup(
    React.createElement(Document, {
      version: config.version,
      skipClient: true, // Don't run client.jsx
      styles: css,
      contentHtml: innerHtml
    })
  );

  console.log('server err '+ req.url +': ~'+ page.length +' bytes');

  res.writeHead(500, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': stringLengthInBytes(page)
  });
  res.write(page);
  res.end();

  // pass it off to the next middleware
  next();
}

// handles server-side rendering of our application
function renderServer(req, res, next) {

  Router.run(routes, req.url, function (Handler, state) {

    var preloadAction;

    // Preload the data (into a promise)
    try {
      preloadAction = preloadData(state.routes, state.params, req.cookies);
    } catch (e) {
      // For any exceptions preloading, fail the promise and let the rendering
      // section deal with it
      preloadAction = Promise.reject(e);
    }

    // Render the page (preloaded data or not);
    preloadAction.then(function (prefetchedData) {
      var isNotFound = false,
          innerHtml, css, page;

      css = styleInterceptor.intercept(() =>
        innerHtml = React.renderToString(<Handler {...prefetchedData }/>)
      );

      // the Document renders to non-react markup, since the client
      // doesn't touch it.
      page = '<!DOCTYPE html>' + React.renderToStaticMarkup(
        React.createElement(Document, {
          version: config.version,
          styles: css,
          dataState: prefetchedData,
          contentHtml: innerHtml
        })
      );

      // Forcefully prevent any forms submitting before client.js has loaded
      // React doesn't support setting the onsubmit attribute directly
      page = page.replace(/<body>/, '<body onsubmit="return false;">\n');

      console.log('rendering '+ req.url +': ~'+ page.length +' bytes');

      // determine if this is a notfound page
      for (let i in state.routes) {
        if (state.routes[i].isNotFound) {
          isNotFound = true;
        }
      }

      // Not very advanced, but it does the job (replying to GET requests)
      res.writeHead(( isNotFound ? 404 : 200 ), {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': stringLengthInBytes(page)
      });
      res.write(page);
      res.end();

      // pass it off to the next middleware
      next();

    })
    .catch(e => {
      // Errors that occur during the rendering callback
      _renderServerError(e, req, res, next);
    });

  });
}

export default function() {};

export { renderServer as middleware };

