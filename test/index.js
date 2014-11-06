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

var User = Model.define('User', {
  tableName: 'users',
  hasOne: {
    name: 'account',
    model: 'Account',
    key: 'user_id'
  }
});

var Account = Model.define('Account', {
  tableName: 'account',
  belongsTo: {
    name: 'user',
    model: 'User',
    key: 'user_id'
  }
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
      var user = new User({ id: 1, username: 'user' });
      var account = new Account({ id: 1, user_id: 1 });
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
      Account.create({ id: 1, user_id: 1 }).then(function(account) {
        account.should.instanceof(Account);
        done();
      });
    });

    it('where method should be same with knex', function() {
      User.where.should.be.a('function');
      Account.where.should.be.a('function');
      var sql = User.where('id', 1).select().toString();
      sql.should.be.a('string');
      sql.should.equal('select * from "users" where "id" = 1');
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

    it('first method should return single instance with promise', function(done) {
      User.first.should.be.a('function');
      Account.first.should.be.a('function');
      User.first('id', 1).then(function(user) {
        user.should.instanceof(User);
        done();
      });
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
      }).then(function(isUpdate) {
        isUpdate.should.be.ok;
        return knex('users').where('username', 'updated').select();
      }).then(function(users) {
        users.should.have.length(1);
        done();
      });
    });

    it('should have relation', function(done) {
      Promise.join(
        User.create({ id: 3, username: 'user3' }).then(function(user) {
          user.account.should.instanceof(Relation);
        }),
        Account.create({ id: 3, user_id: 3 }).then(function(account) {
          account.user.should.instanceof(Relation);
        })
      ).then(function() { done(); });
    });
  });

});
