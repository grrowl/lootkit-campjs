'use strict';

import Promise from 'bluebird';

// ServerError is a fatal error on the server itself, not fixable by the user
// and not an issue with the client library. We could probably try again later.

export default class ServerError extends Promise.OperationalError {
  constructor(message, originalError) {
    super(message);
    this.name = 'ServerError';
    this.originalError = originalError;
  }
}
