'use strict';

import config from 'config';
import React from 'react';
import Router, { RouteHandler, Link } from 'react-router';

var AppRoute = React.createClass({

  render() {
    // This must be included in all pages if app.scss is to be written to disk
    require('app.scss');

    return (
      <RouteHandler {...this.props} />
    );
  }
});

export default AppRoute;
