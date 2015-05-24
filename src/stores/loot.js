'use strict';

import { Store } from 'flux';

import ConnectivityActions from 'actions/connectivity';
import LootActions from 'actions/loot';
import Loot from 'loot';

import http from 'superagent';

class LootStore extends Store {
  constructor() {
    super();
    LootActions.addListener('create', this.onCreateLoot.bind(this));
    ConnectivityActions.addListener('online', this.onOnline.bind(this));

    try {
      this.loot = JSON.parse(localStorage.getItem('loot')) || [];
    } catch (e) {
      console.warn('Couldn\'t load LootStore', e);
      this.loot = [];
    }
  }

  onCreateLoot(obj) {
    if (!(obj instanceof Loot))
      obj = new Loot(obj);

    this.loot.push(obj);
    super.emitChange();

    localStorage.setItem('loot', JSON.stringify(this.loot));
  }

  onOnline() {
    this._pushToServer();
    this._pullFromServer();
  }

  _pushToServer() {
    var newCollection = [],
        newIndexMap = {};

    for (var i in this.loot) {
      if (!this.loot[i]._id) {
        newIndexMap[i] = newCollection.push(this.loot[i]) - 1;
      }
    }
    console.log('built newIndexMap', newIndexMap);

    if (newCollection.length === 0)
      return;

    // sync!
    http
      .put('/"db"')
      .send(newCollection)
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        // go son
        if (err) {
          console.warn('PUT sync error:', err, res);
          return;
        }

        for (var i in res.body) {
          // update id for those records.
          // var origIndex = newIndexMap.indexOf(i);
          var origIndex;
          for (var j in newIndexMap) {
            if (newIndexMap[j] == i) {
              origIndex = i;
              break;
            }
          }
          if (origIndex === undefined)
            console.error('origIndex not found')

          this.loot[origIndex]._id = res.body[i]._id;
        }

        localStorage.setItem('loot', JSON.stringify(this.loot));
        this.emitChange();
      });
  }

  _pullFromServer() {
    http
      .get('/"db"')
      .end((err, res) => {
        if (err) {
          console.warn('GET sync error:', err, res);
          return;
        }

        for (var i in res.body) {
          this.loot.push(res.body[i]);
        }

        this.emitChange();
      });
  }

}

// There can be only one
export default new LootStore();
