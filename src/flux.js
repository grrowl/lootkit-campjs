
import _ from 'lodash';
import invariant from 'invariant';
import { EventEmitter } from 'events';

// Actions have events of one of this.events[];
// export class Action extends EventEmitter {
export class Action {
  constructor() {
    // super();
  }

  addListener(event, callback) {
    invariant(this.actions.indexOf(event) > -1,
      "Action.addListener event not in set"
    );
    // super.addListener.call(this, event, callback);
    this.addListener.call(this, event, callback);
  }

  removeListener(event, callback) {
    invariant(this.actions.indexOf(event) > -1,
      "Action.removeListener event not in set"
    );
    // super.removeListener(event, callback);
    this.removeListener(event, callback);
  }

  emit(event) {
    invariant(this.actions.indexOf(event) > -1,
      "Action.emit event not in set"
    );
    // super.emit(event, callback);
    this.emit(event);
  }
};

// the bad things
_.extend(Action.prototype, EventEmitter.prototype);


const changeEvent = 'change';
// export class Store extends EventEmitter {
export class Store {

  addChangeListener(callback) {
    // super.addListener(changeEvent, callback);
    this.addListener(changeEvent, callback);
  }

  removeChangeListener(callback) {
    // super.addListener(changeEvent, callback);
    this.addListener(changeEvent, callback);
  }

  emitChange() {
    // super.emit(changeEvent);
    this.emit(changeEvent);
  }
};

// the bad things
_.extend(Store.prototype, EventEmitter.prototype);
