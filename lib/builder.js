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

KnexBuilder.prototype.create = function(params) {
  var self = this;
  this._method = 'insert';

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
      return self.model.new(result);
    }
    return result;
  }).then(callback);
};
