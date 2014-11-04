'use strict';
var _ = require('lodash');

module.exports = Base;

function Base(params) {
  this._meta = params;
  this.id = params.id;
};

Base.new = function() {
  var obj = Object.create(this.prototype);
  return this.apply(obj, arguments), obj;
};

Base.find = function(query) {
  var self = this;
  var knex = this._knex(this._tableName);

  if(query) {
    knex = knex.where.apply(knex, arguments);
  }
  return knex.select().map(function(item) {
    return self.new(item);
  });
};

Base.first = function(query) {
  var self = this;
  var knex = this._knex(this._tableName);

  if(query) {
    knex = knex.where.apply(knex, arguments);
  }

  return knex.first().then(function(result) {
    return self.new(result);
  });
};

Base.where = function() {
  var knex = this._knex(this._tableName);
  return knex.where.apply(knex, arguments);
};

Base.create = function(params) {
  var self = this;
  return this._knex(this._tableName)
    .insert(params)
    .then(function(insertId) {
      return self.first('id', insertId[0]);
    });
};

Base.prototype.delete = function() {
  var _class = this.__proto__.class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).delete();
};

Base.prototype.update = function(params) {
  var _class = this.__proto__.class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).update(params);
};

Base.prototype.toJSON = function() {
  return this._meta;
};
