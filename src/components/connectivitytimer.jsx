'use strict';

import React from 'react';
import cx from 'classnames';

import ConnectivityActions from 'actions/connectivity';

const checkInterval = 3000; // 3s
const refreshInterval = 100; // 100ms
export default class ConnectivityTimer extends React.Component {

  constructor() {
    super();

    this.state = {
      isOnline: false,
      isSyncing: false,
      lastCheck: null
    };
    this.onlineTimer = null;
    this.refreshTimer = null;
  }

  componentDidMount() {
    this.onlineTimer = setInterval(this._checkOnline.bind(this), checkInterval);
    this._checkOnline.bind(this);

    this.refreshTimer = setInterval(this.forceUpdate.bind(this), refreshInterval);
  }

  componentWillUnmount() {
    clearInterval(this.onlineTimer);
    clearInterval(this.refreshTimer);
  }

  _checkOnline() {
    this.setState({
      isOnline: navigator.onLine,
      lastCheck: window.performance.now()
    });

    ConnectivityActions.emit(navigator.onLine ? 'online' : 'offline');
  }

  render() {
    // Example of how to include modular stylesheets alongside your javascript.
    require('./connectivitytimer.scss');

    let classes = cx({
      connectivityTimer: true,
      online: !!this.state.isOnline,
      offline: !this.state.isOnline
    });

    return (
      <button className={ classes }>
        {
          this.state.isOnline
          ? (
              this.state.isSyncing
              ? 'Syncing'
              : 'Online'
            )
          : 'Offline'
        }
        { ' ' }
        {
          Math.floor((window.performance.now() - this.state.lastCheck)) / 1000
        }
      </button>
    );
  }
}
