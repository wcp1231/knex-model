'use strict';

var down = exports.down = function(knex, Promise) {
  return Promise.join(
    knex.schema.dropTableIfExists('users'),
    knex.schema.dropTableIfExists('account'),
    knex.schema.dropTableIfExists('entries'),
    knex.schema.dropTableIfExists('likes'),
    knex.schema.dropTableIfExists('roles'),
    knex.schema.dropTableIfExists('role_user')
  );
};

exports.up = function(knex, Promise) {
  return Promise.join(
    down(knex, Promise),

    knex.schema.createTable('users', function(t) {
      t.increments('id').primary();
      t.string('username').notNullable();
    }),

    knex.schema.createTable('account', function(t) {
      t.increments('id').primary();
      t.integer('user_id', 10)
        .notNullable()
        .unsigned()
        .references('users.id');
      t.string('bio');
    }),

    knex.schema.createTable('roles', function(t) {
      t.increments('id').primary();
      t.string('name');
    }),

    knex.schema.createTable('role_user', function(t) {
      t.increments('id').primary();
      t.integer('user_id', 10)
        .notNullable()
        .unsigned()
        .references('users.id');
      t.integer('role_id', 10)
        .notNullable()
        .unsigned()
        .references('roles.id');
    }),

    knex.schema.createTable('entries', function(t) {
      t.increments('id').primary();
      t.integer('user_id', 10)
        .notNullable()
        .unsigned()
        .references('users.id');
      t.string('title').notNullable();
    }),

    knex.schema.createTable('likes', function(t) {
      t.increments('id').primary();
      t.integer('user_id', 10)
        .notNullable()
        .unsigned()
        .references('users.id');
      t.integer('entry_id', 10)
        .notNullable()
        .unsigned()
        .references('entries.id');
    })
  );
};
