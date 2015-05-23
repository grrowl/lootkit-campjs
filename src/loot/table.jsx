'use strict';

import React from 'react';

export default class LootTable extends React.Component {

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>type</th>
            <th>message</th>
            <th>location</th>
          </tr>
        </thead>
        <tbody>
        {
          this.props.loot.map((loot) => {
            return (
              <tr>
                <td>{ loot._id }</td>
                <td>{ loot.type }</td>
                <td>{ loot.message }</td>
                <td>{ loot.location }</td>
              </tr>
            );
          })
        }
        {
          this.props.loot.length === 0
          ? <tr>
              <td colSpan="4">No loot to display</td>
            </tr>
          : null
        }
        </tbody>
      </table>
    );
  }
}

LootTable.propTypes = {
  loot: React.PropTypes.array.isRequired
};
