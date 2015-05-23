'use strict';

import React from 'react';
import cx from 'classnames';

import GeolocationStore from 'stores/geolocation';

export default class ConnectivityTimer extends React.Component {

  constructor() {
    super();

    this.state = {
      isLocated: false,
      location: GeolocationStore.location || ['dunno']
    };
  }

  componentWillMount() {
    GeolocationStore.addChangeListener(this._onLocationUpdate.bind(this));
  }

  componentWillUnmount() {
    GeolocationStore.removeChangeListener(this._onLocationUpdate.bind(this));
  }

  _onLocationUpdate() {
    this.setState({
      isLocated: GeolocationStore.located,
      location: GeolocationStore.location
    });
  }

  render() {
    let classes = cx({
      geolocationStatus: true,
      located: this.state.isLocated
    }),
      locationString;

    // if (this.state.location instanceof Location)
    if (this.state.location.latitude)
      locationString = this.state.location.latitude + ' ' + this.state.location.longitude;
    else
      locationString = 'Unknown';

    return (
      <button className={ classes } title={ locationString }>
        {
          this.state.isLocated
          ? 'Found'
          : 'Unknown'
        }
      </button>
    );
  }
}

ConnectivityTimer.propTypes = {
  onChange: React.PropTypes.func
};
