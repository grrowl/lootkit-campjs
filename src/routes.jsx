'use strict';

// All routes within the app

import config from 'config';
import React from 'react';
import Router, {
  Route,
  DefaultRoute,
  NotFoundRoute,
  Redirect
} from 'react-router';

import AppRoute from 'components/approute';
import NotFound from 'server/notfoundroute';

// Landing pages
import Home from 'home/route';

export default (
  <Route handler={ AppRoute }>

    <Route name="home" path="/" handler={ Home } />
    <DefaultRoute handler={ Home } />

    <NotFoundRoute handler={ NotFound } />
  </Route>
);
