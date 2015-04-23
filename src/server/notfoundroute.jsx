'use strict';

/*
# NotFoundRoute
 */

import React from 'react';
import ServerErrorView from 'server/errorview';

module.exports = React.createClass({
  render() {

    return (
      <ServerErrorView title="404 Not Found" message="We couldn't find that page. Sorry :(" />
    );

  }
});
