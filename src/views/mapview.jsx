'use strict';

import _ from 'lodash';
import React from 'react';
import Router, { Link } from 'react-router';
import config from 'config';

import LootTable from 'loot/table';

import LootActions from 'actions/loot';
import Loot from 'loot';

export default class MapView extends React.Component {

  render() {
    return (
      <div>
        Close your eyes. Imagine this is a map. Yes.
        Let the geospacial representation wash over you.
      </div>
    );

  }

};

MapView.propTypes = {
  loot: React.PropTypes.array.isRequired
};
