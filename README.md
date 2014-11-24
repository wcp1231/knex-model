# knex-model [![Build Status](https://travis-ci.org/wcp1231/knex-model.svg?branch=master)](https://travis-ci.org/wcp1231/knex-model) [![Coverage Status](https://coveralls.io/repos/wcp1231/knex-model/badge.png?branch=master)](https://coveralls.io/r/wcp1231/knex-model?branch=master) [![Code Climate](https://codeclimate.com/github/wcp1231/knex-model/badges/gpa.svg)](https://codeclimate.com/github/wcp1231/knex-model)

Small ORM.
It is built atop the [Knex Query Builder](http://knexjs.org/)

## Example

```js
var Model = require('knex-model')(knex);
var Promise = require('bluebird');

var User = Model.define('User', {
  tableName: 'users',
  hasMany: [
    {
      name: 'entries',
      model: 'Entry',
      key: 'user_id'
    }
  ]
}, {
  instanceMethod: function() {}
});

var Entry = Model.define('Entry', {
  tableName: 'entries',
  belongsTo: {
    name: 'author',
    model: 'User',
    key: 'user_id'
  }
});

User.register('beforeCreate', function(data) {
  var datetime = new Date();
  data.created_at = data.updated_at = data;
});
//  Support Promise
User.register('afterCreate', function(newId) {
  newId = newId[0];
  return Entry.create({ title: 'create new user ' + newId });
});

// same to knex('users').where(...).update({})
User.where(...).update({...});
User.where(...).delete();

User.first('id', 1).then(function(user) {
  return user.entries.create({
    title: 'title'
  });
}).then(function(insertId) {
  return user.entries.find();
}).then(function(entries) {
  console.log(entries);
  return Promise.props({
    isOk: entries[0].update({ title: 'updated' }),
    deleteId: entries[1].delete()
  });
}).then(function(result) {
  console.log(result);
});

```

## TODO

- [x] test
- [x] example
- [x] Relation `through`
- [x] Realtion `hasOne`
- [ ] boardcast event
  - [x] `beforeCreate`
  - [x] `afterCreate`
  - [x] `beforeUpdate`
  - [x] `afterCreate`
  - [ ] `beforeFind`
  - [ ] `afterFind`
