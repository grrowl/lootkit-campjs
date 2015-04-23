'use strict';

import _ from 'lodash';
import React from 'react';
import Router, { Link } from 'react-router';
import config from 'config';

var LandingHome = React.createClass({
  mixins: [
    Router.Navigation // navigating to new routes
  ],

  fetchData(params) {
    return null;
  },

  getDefaultProps() {
    return {};
  },

  render() {
    require('./route.scss');

    return (
      <section>
        <header>
          <h1>Isomorphic React Starter Kit</h1>
          <h2>Lovingly made by the folks at CareerLounge</h2>
        </header>
      </section>
    );

  }
});

export default LandingHome;
