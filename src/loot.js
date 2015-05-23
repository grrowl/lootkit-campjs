
import invariant from 'invariant';

export default class Loot {
  constructor(obj) {
    invariant(obj.message, "Loot instated without message");
    invariant(obj.location, "Loot instated without location");
    invariant(obj.location.length === 2, "Loot location must have 2 values");

    this._id = 'x'+ ~~(Math.random() * 100);
    this.type = obj.type || 'text';
    this.message = obj.message;
    this.location = obj.location;
  }
}
