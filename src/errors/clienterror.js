'use strict';

import Promise from 'bluebird';

// ClientError is a fatal error not caused by user-entered data, so likely a
// bug in the client itself

export default class ClientError extends Promise.OperationalError {
  constructor(message, originalError) {
    super(message);
    this.name = 'ClientError';
    this.originalError = originalError;
  }
}
