'use strict';

import config from 'config';
import React from 'react';
import Router, { RouteHandler, Link } from 'react-router';

import ConnectivityTimer from 'components/connectivitytimer';
import GeolocationStatus from 'components/geolocationstatus';

import GeolocationStore from 'stores/geolocation';

import LootTable from 'loot/table';
import LootActions from 'actions/loot';
import Loot from 'loot';

export default class AppRoute extends React.Component {

  _onLootKeypress(event) {
    const KEY_ENTER = 13;

    if (event.keyCode == KEY_ENTER) {
      let newLoot = new Loot({
        message: event.target.value,
        location: [
          GeolocationStore.location.latitude,
          GeolocationStore.location.longitude
        ]
      });
      LootActions.emit('create', newLoot);

      // Reset input
      event.target.value = '';
    }
  }

  render() {
    // This must be included in all pages if app.scss is to be written to disk
    require('app.scss');

    return (
      <section>
        <header>
          <h1>LootKit</h1>
          <ConnectivityTimer />
          <GeolocationStatus />
          { '  ' }
          <Link to="map">Map</Link>
          { '  ' }
          <Link to="list">List</Link>
          <hr />
        </header>

        <RouteHandler {...this.props}  />
        <input
          placeholder="New message (ENTER to send)"
          onKeyUp={ this._onLootKeypress } />
      </section>
    );

  }
};
