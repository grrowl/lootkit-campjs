'use strict';

// Renders document boilerplate
// <!doctype html> is added later -- non-closing tags are unsupported in React
// Must be in pure JS since it's required directly by the Grunt server

import React from 'react';

import config from 'config';

module.exports = React.createClass({
  render() {
    return (
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          {
            this.props.styles ?
            <style type="text/css" id="preloaded-css"
              dangerouslySetInnerHTML={ { __html: this.props.styles } } />
            : ''
          }
          {
            this.props.skipStyles
            ? null
            : <link rel="stylesheet" href={ this.props.version +'/app.css' } />
          }
        </head>
        <body>

          <div id="react-content"
            dangerouslySetInnerHTML={ { __html: this.props.contentHtml } } />

          {
            this.props.dataState
            ? <script id="react-dataState" type="application/json">
                {/* http://benalpert.com/2012/08/03/preventing-xss-json.html */}
                {/* the following will be output html-escaped to the browser */}
                { JSON.stringify(this.props.dataState) }
              </script>
            : ''
          }
          {
            this.props.skipClient
            ? null
            : <script src={ this.props.version +"/client.js" }></script>
          }

        </body>
      </html>
    );

  }
});
