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

import NotFound from 'server/notfoundroute';

import AppRoute from 'components/approute';
import MapView from 'views/mapview';
import ListView from 'views/listview';

export default (
  <Route handler={ AppRoute }>

    <Route name="map" handler={ MapView } />
    <Route name="list" handler={ ListView } />

    <DefaultRoute handler={ ListView } />
    <NotFoundRoute handler={ NotFound } />
  </Route>
);
