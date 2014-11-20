'use strict';

var _ = require('lodash');
var methods = require('./methods');

module.exports = KnexBuilder;

function KnexBuilder(model) {
  var self = this;
  var tableName = model._tableName;

  this.knex = model._knex(tableName);
  this.model = model;
  methods.forEach(function(method) {
    self[method] = function() {
      self.knex = self.knex[method].apply(self.knex, arguments);
      return self;
    };
  });

  return this;
}

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

KnexBuilder.prototype.update = function(params) {
  var model = this.model;
  var knex = this.knex;

  if(model.onUpdate && 'function' === typeof model.onUpdate) {
    model.onUpdate.call(model, params);
  }

  this.knex = knex.update.apply(knex, arguments);
  return this;
};

KnexBuilder.prototype.create = function(params) {
  var self = this;
  var model = self.model;
  this._method = 'insert';

  if(model.onCreate && 'function' === typeof model.onCreate) {
    model.onCreate.call(model, params);
  }

  return this.knex.insert(params).then(function(insertId) {
    return self.findOne('id', insertId[0]);
  });
};

KnexBuilder.prototype.then = function(callback) {
  var self = this;
  return this.knex.then(function(result) {
    if(self._method === 'select') {
      if(_.isArray(result)) {
        return _.map(result, function(item) {
          return self.model.new(item);
        });
      }
      return result ? self.model.new(result) : null;
    }
    return result;
  }).then(callback);
};

KnexBuilder.prototype.map = function(callback) {
  var self = this;
  return this.knex.map(function(item) {
    return self.model.new(item);
  }).map(callback);
};
