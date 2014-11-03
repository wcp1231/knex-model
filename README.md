# knex-model

......

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
});

var Entry = Model.define('Entry', {
  tableName: 'entries',
  belongsTo: {
    name: 'author',
    model: 'User',
    key: 'user_id'
  }
});

User.find('id', 1).then(function(users) {
  var user = users[0];
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

- [ ] test
- [ ] example
- [ ] Relation `through`
- [x] Realtion `hasOne`
