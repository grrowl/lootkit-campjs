'use strict';
/*
  # NOT USING THIS YET
*/

import { Store } from 'flux';

export default class CredentialStore extends Store {
  constructor() {
    super();

    try {
      this.privateKey = localStorage.getItem('privateKey');
      this.publicKey = localStorage.getItem('publicKey');
    } catch (e) {
      console.error('Couldn\'t load CredentialStore', e);
      this.privateKey = 'superPrivateKey';
      this.publicKey = 'somewhatPublicKeylol';
    }
  }

  get privateKey() {

  }
  get publicKey() {

  }
}
