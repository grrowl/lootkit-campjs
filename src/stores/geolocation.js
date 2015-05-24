'use strict';

import { Store } from 'flux';

class GeolocationStore extends Store {
  constructor() {
    super();

    try {
      navigator.geolocation.watchPosition(
        this._onLocationUpdate.bind(this),
        this._onLocationError.bind(this),
        {
          enableHighAccuracy: true,
          maximumAge: 60 * 1000 // 1min
        });

    } catch (e) {
      console.warn('Couldn\'t get geolocation', e);
      this.location = {
        latitude: -38.389706,
        longitude: 145.146423
      }; // campjs!
      this.located = false;
    }
  }

  _onLocationUpdate(position) {
    console.info('Updated location', position.coords, position.timestamp);
    this.located = true;
    this.location = position.coords;
    super.emitChange();
  }

  _onLocationError(error) {
    console.warn('Couldn\'t get geolocation', error);
    this.located = false;
  }

}

// There can be only one
export default new GeolocationStore();
