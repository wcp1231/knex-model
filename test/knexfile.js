'use strict';

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: "./test.sqlite"
    },
    seeds: { directory: './seeds' }
  }
};
