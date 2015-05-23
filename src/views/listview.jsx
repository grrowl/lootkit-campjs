'use strict';

import _ from 'lodash';
import React from 'react';
import Router, { Link } from 'react-router';
import config from 'config';

import LootStore from 'stores/loot';
import LootActions from 'actions/loot';

import LootTable from 'loot/table';

export default class ListView extends React.Component {
  constructor() {
    super();

    this.state = {
      loot: []
    };
  }

  // default props loot: []

  componentWillMount() {
    LootStore.addChangeListener(this._onStoreUpdate.bind(this));

    this.setState({
      loot: LootStore.loot
    })
  }

  componentWillUnmount() {
    LootStore.removeChangeListener(this._onStoreUpdate.bind(this));
  }

  _onStoreUpdate() {
    console.log('loot changed!', LootStore.loot);
    this.setState({
      loot: LootStore.loot
    })
  }

  render() {
    return (
      <LootTable loot={ this.state.loot }/>
    );
  }
};
