'use strict';

// Authentication route parent layout

import React from 'react';

var AuthRoute = React.createClass({

  getDefaultProps() {
    return {
      title: "We encountered a problem building this page for you.",
      subtitle: null,
      message: "Unknown error. Sorry."
    };
  },

  render() {
    require('./errorview.scss');

    var error = this.props.message || {};
    if (error.stack)
      error = error.stack; // print the stacktrace instead

    return (
      <section id="route-servererror">

        <h1>
          { this.props.title }
        </h1>
        {
          this.props.subtitle
          ? <h2>{ this.props.subtitle }</h2>
          : null
        }
        <pre>
          { error }
        </pre>

      </section>
    );
  }
});

export default AuthRoute;
