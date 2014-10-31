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

Base.find = function() {
  var self = this;
  var knex = this._knex(this._tableName);
  return knex.where.apply(knex, arguments).select().then(function(results) {
    if(_.isArray(results)) {
      return _.map(results, function(item) { return self.new(item); });
    }
    return self.new(results);
  });
};

Base.create = function(params) {
  return this._knex(this._tableName).insert(params);
};

Base.prototype.delete = function() {
  var _class = this._class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).delete();
};

Base.prototype.update = function(params) {
  var _class = this._class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).update(params);
};
