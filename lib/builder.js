'use strict';

var _ = require('lodash');
var Promise = require("bluebird");
var methods = require('./methods');

module.exports = KnexBuilder;

function KnexBuilder(model) {
  var self = this;
  var tableName = model._tableName;

  this.knex = model._knex(tableName);
  this.model = model;
  _(methods).without('update', 'where').forEach(function(method) {
    self[method] = function() {
      self.knex = self.knex[method].apply(self.knex, arguments);
      return self;
    };
  });

  return this;
}

KnexBuilder.prototype.where = function(col, op, value) {
  var knex = this.knex;
  this._id = null;

  if(arguments.length === 1) {
    this._id = _.result(col, 'id') || null;
  } else if(col === 'id') {
    this._id = arguments.length === 2 ? op : value;
  }

  this.knex = this.knex.where.apply(knex, arguments);
  return this;
};

KnexBuilder.prototype.find = function(query) {
  var self = this;
  var knex = this.knex;
  this._method = 'select';

  if(query) {
    this.knex = knex.where.apply(knex, arguments);
  }

  return self.select();
};

KnexBuilder.prototype.findOne = function(query) {
  var self = this;
  var knex = this.knex;
  this._method = 'select';

  if(query) {
    this.knex = knex.where.apply(knex, arguments);
  }

  return self.first();
};

KnexBuilder.prototype.update = function() {
  this._method = 'update';
  this._updateArguments = arguments;

  return this;
};

KnexBuilder.prototype.create = function(params) {
  var self = this;
  var model = self.model;
  var newId = null;
  this._method = 'insert';

  return Promise.resolve(params).then(function(data) {
    /** Before create **/
    var callbackQueue = model._eventQueue.beforeCreate;
    return Promise.map(callbackQueue, function(callback) { return callback(data); });
  }).then(function() {
    return self.knex.insert(params);
  }).then(function(_newId) {
    newId = _newId;

    /** After create **/
    var callbackQueue = model._eventQueue.afterCreate;
    return Promise.map(callbackQueue, function(callback) { return callback(newId); });
  }).then(function() {
    return self.findOne('id', newId[0]);
  });

};

KnexBuilder.prototype.then = function(resolve, reject, progress) {
  var self = this;
  var model = self.model;

  return Promise.resolve().then(function() {
    /** Before **/
    if(self._method === 'update') {
      var cbQueue = model._eventQueue.beforeUpdate;
      var args = self._updateArguments;
      return Promise
        .map(cbQueue, function(callback) { return callback.apply(null, args); })
        .then(function() {
          return self.knex.update.apply(self.knex, args);
        });
    }

    return self.knex;
  }).then(function(result) {
    if(self._method === 'select') {
      if(_.isArray(result)) {
        return _.map(result, function(item) {
          return self.model.new(item);
        });
      }
      return result ? self.model.new(result) : null;
    } else if(self._method === 'update' && self._id !== null) {
      return self.findOne('id', self._id);
    }
    return result;
  }).then(function(data) {
    /** After **/
    var callbackQueue = [];
    if(self._method === 'update') { callbackQueue = model._eventQueue.afterUpdate; }
    Promise.map(callbackQueue, function(callback) { return callback(data); });
    return data;
  }).then(resolve, reject, progress);
};

KnexBuilder.prototype.map = function(callback) {
  var self = this;
  return this.knex.map(function(item) {
    return self.model.new(item);
  }).map(callback);
};
