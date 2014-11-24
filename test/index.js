'use strict';

var chai = require("chai");
var Promise = require('bluebird');
var should = chai.should();
var config = require('./knexfile');

var knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: './test/test.sqlite' }
});
var Model = require('../index')(knex);
var Relation = require('../lib/relation');

var User = Model.define('User', {
  tableName: 'users',
  hasOne: {
    name: 'account',
    model: 'Account',
    key: 'user_id'
  },
  hasMany: [
    {
      name: 'entries',
      model: 'Entry',
      key: 'user_id'
    },
    {
      name: 'roles',
      model: 'Role',
      key: 'id',
      through: {
        model: 'RoleUser',
        throughFk: 'user_id',
        otherKey: 'role_id'
      }
    }
  ]
});

var Account = Model.define('Account', {
  tableName: 'account',
  belongsTo: {
    name: 'user',
    model: 'User',
    key: 'user_id'
  }
});

var Entry = Model.define('Entry', {
  tableName: 'entries',
  belongsTo: {
    name: 'user',
    model: 'User',
    key: 'user_id'
  }
});

var Role = Model.define('Role', {
  tableName: 'roles',
  hasMany: [
    {
      name: 'users',
      model: 'User',
      key: 'id',
      through: {
        model: 'RoleUser',
        throughFk: 'role_id',
        otherKey: 'user_id'
      }
    }
  ]
});

var RoleUser = Model.define('RoleUser', {
  tableName: 'role_user',
  belongsTo: []
});

User.register('beforeCreate', function(data) {
  data.username += ' new!';
});
User.register('afterCreate', function(newId) {
  newId = newId[0];
  return Account.create({ user_id: newId });
});
User.register('beforeUpdate', function(data) {
  data.username += ' update!';
});

describe('model', function() {

  describe('define', function() {
    it('should has name', function() {
      User._name.should.be.a('string');
      User._name.should.equal('User');
      Account._name.should.be.a('string');
      Account._name.should.equal('Account');
    });

    it('should has table name', function() {
      User._tableName.should.be.a('string');
      User._tableName.should.equal('users');
      Account._tableName.should.be.a('string');
      Account._tableName.should.equal('account');
    });

    it('can instantiate', function() {
      var user = User.new({ id: 1, username: 'user' });
      var account = Account.new({ id: 1, user_id: 1 });
      user.should.instanceof(User);
      account.should.instanceof(Account);
    });
  });

  describe('class method', function() {
    before(function(done) {
      knex('users')
        .insert({ id: 1, username: 'user' })
        .then(function() { done(); });
    });

    after(function(done) {
      Promise.join(
        knex('users').del(),
        knex('account').del()
      ).then(function() { done(); });
    });

    it('new method should return instance', function() {
      User.new.should.be.a('function');
      Account.new.should.be.a('function');
      var user = User.new({ id: 1, username: 'user' });
      var account = Account.new({ id: 1, user_id: 1 });
      user.should.instanceof(User);
      account.should.instanceof(Account);
    });

    it('create method should return instance with promise', function(done) {
      User.create({ username: 'ins' }).then(function(user) {
        user.should.instanceof(User);
        done();
      });
    });

    it('find method should return array of instance with promise', function(done) {
      User.find.should.be.a('function');
      Account.find.should.be.a('function');
      User.find('id', 1).then(function(users) {
        users.should.be.a('array');
        users[0].should.instanceof(User);
        done();
      });
    });

    it('find method should return empty array when find nothing', function(done) {
      User.find('id', 999).then(function(users) {
        users.should.have.length(0);
        done();
      });
    });

    it('findOne method should return single instance with promise', function(done) {
      User.findOne.should.be.a('function');
      Account.findOne.should.be.a('function');
      User.findOne('id', 1).then(function(user) {
        user.should.instanceof(User);
        done();
      });
    });

    it('findOne method should return null when find nothing', function(done) {
      User.findOne('id', 999).then(function(user) {
        chai.expect(user).be.a('null');
        done();
      });
    });

    it('should support map method', function(done) {
      User.find().map(function(user) {
        user.should.instanceof(User);
      }).then(function() {
        done();
      });
    });

    it('can method chaining like knex', function() {
      User.find().limit(10).offset(30).knex.toString()
        .should.equal('select * from "users" limit 10 offset 30');
      Entry.find().whereIn('user_id', function() {
        this.select('id').from('users');
      }).knex.toString()
        .should.equal('select * from "entries" where "user_id" in (select "id" from "users")');
    });
  });

  describe('instance', function() {
    after(function(done) {
      Promise.join(
        knex('users').del(),
        knex('account').del()
      ).then(function() { done(); });
    });

    it('can be delete', function(done) {
      User.create({ id: 1, username: 'user' }).then(function(user) {
        user.should.respondTo('delete');
        return user.delete();
      }).then(function(isDelete) {
        isDelete.should.be.ok;
        return knex('users').select();
      }).then(function(users) {
        users.should.have.length(0);
        done();
      });
    });

    it('can be update', function(done) {
      User.create({ id: 2, username: 'user2' }).then(function(user) {
        user.should.respondTo('update');
        return user.update({ username: 'updated' });
      }).then(function(user) {
        user._meta.username.should.equal('updated update!');
        done();
      }).catch(done);
    });

    it('should have relation', function(done) {
      Promise.join(
        User.create({ id: 3, username: 'user3' }).then(function(user) {
          user.account.should.instanceof(Relation);
        }),
        Account.create({ user_id: 3 }).then(function(account) {
          account.user.should.instanceof(Relation);
        })
      ).then(function() { done(); });
    });
  });

  describe('relation', function() {
    before(function(done) {
      Promise.join(
        knex('users').insert({ id: 4, username: 'user' }),
        knex('account').insert({ id: 4, user_id: 4 }),
        knex('entries').insert({ id: 1, user_id: 4, title: 'test'}),
        knex('entries').insert({ id: 2, user_id: 4, title: 'test2'}),
        knex('roles').insert({ id: 1, name: 'admin'}),
        knex('roles').insert({ id: 2, name: 'staff'}),
        knex('role_user').insert({ id: 1, user_id: 4, role_id: 1 }),
        knex('role_user').insert({ id: 2, user_id: 4, role_id: 2 })
      ).then(function() { done(); });
    });

    after(function(done) {
      Promise.join(
        knex('users').del(),
        knex('account').del(),
        knex('entries').del(),
        knex('roles').del(),
        knex('role_user').del()
      ).then(function() { done(); });
    });

    it('belongsTo and hasOne should return single instance', function(done) {
      User.findOne('id', 4).then(function(user) {
        return user.account.find();
      }).then(function(account) {
        account.should.instanceof(Account);
        return account.user.find();
      }).then(function(user) {
        user.should.instanceof(User);
        done();
      });
    });

    it('hasMany should return array of instance', function(done) {
      User.findOne('id', 4).then(function(user) {
        return user.entries.find();
      }).then(function(entries) {
        entries.should.be.a('array')
          .and.have.length(2);
        done();
      });
    });

    it('hasMany can create model', function(done) {
      var user = null;
      User.findOne('id', 4).then(function(_user) {
        user = _user;
        return user.entries.create({ id: 3, title: 'created' });
      }).then(function(newEntry) {
        newEntry.should.instanceof(Entry);
        newEntry._meta.user_id.should.equal(4);
        return user.entries.find({ id: 3 });
      }).then(function(entries) {
        entries.should.have.length(1);
        entries[0]._meta.title.should.equal('created');
        done();
      });
    });

    it('belongsTo can not create model', function(done) {
      Entry.findOne('id', 1).then(function(entry) {
        return entry.user.create({ username: 'test' });
      }).catch(function(err) {
        err.should.instanceof(Error);
        done();
      });
    });

    it('can delete model', function(done) {
      var user = null;
      User.findOne('id', 4).then(function(_user) {
        user = _user;
        return user.entries.create({ id: 4, title: 'deleted' });
      }).then(function(created) {
        created.id.should.equal(4);
        return user.entries.delete({ id: 4 });
      }).then(function(isDelete) {
        isDelete.should.be.ok;
        return user.entries.find({ id: 4 });
      }).then(function(entries) {
        entries.should.have.length(0);
        done();
      });
    });

    describe('through', function() {
      it('can find models', function(done) {
        Role.findOne('id', 1).then(function(role) {
          return role.users.find();
        }).then(function(users) {
          users[0].should.instanceof(User);
          done();
        });
      });

      it('can findOne model', function(done) {
        Role.findOne('id', 1).then(function(role) {
          return role.users.findOne();
        }).then(function(user) {
          user.should.instanceof(User);
          done();
        });
      });

      it('can delete model', function(done) {
        User.findOne('id', 4).then(function(user) {
          return user.roles.delete({ name: 'staff' });
        }).then(function(isDelete) {
          isDelete.should.be.ok;
          return Role.find();
        }).then(function(roles) {
          roles.should.have.length(1);
          done();
        });
      });
    });
  });

  describe('event', function() {
    it('should throw error when register not supported event', function() {
      var fn = function() { User.register('notSupported'); };
      fn.should.to.throw(Error);
    });

    it('should support beforeCreate', function(done) {
      User.create({ username: 'new user' }).then(function(user) {
        user._meta.username.should.equal('new user new!');
        done();
      });
    });

    it('should support return promise', function(done) {
      User.create({ username: 'promise' }).then(function(user) {
        return Account.findOne('user_id', user.id);
      }).then(function(account) {
        if(!account) {
          throw new Error('event not woking');
        }
        done();
      }).catch(done);
    });

    it('should support beforeUpdate', function(done) {
      var userId = null;
      User.create({ username: 'need update'}).then(function(user) {
        userId = user.id;
        return user.update({ username: 'updated' });
      }).then(function(user) {
        return User.findOne('id', userId);
      }).then(function(user) {
        user._meta.username.should.equal('updated update!');
        done();
      }).catch(done);
    });
  });
});
