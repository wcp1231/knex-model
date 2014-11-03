'use strict';

exports.seed = function(knex, Promise) {
  return knex('users').del().then(function() {
    return knex('users').insert({
      id: 1,
      username: 'test_user'
    });
  });
};
