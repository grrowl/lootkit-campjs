'use strict';

import Promise from 'bluebird';

// AuthenticationError usually means our OAuth token has expired

export default class AuthenticationError extends Promise.OperationalError {
  constructor(message, originalError) {
    super(message);
    this.name = 'AuthenticationError';
    this.originalError = originalError;
  }
}
