'use strict';

import Promise from 'bluebird';

// ValidationError means the client sent data which was invalid. Present it to
// the user and they can fix it up.

export default class ValidationError extends Promise.OperationalError {
  constructor(message, originalError) {
    super(message);
    this.name = 'ValidationError';
    this.originalError = originalError;
  }
}
