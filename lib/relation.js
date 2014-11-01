'use strict';
var _ = require('lodash');

module.exports = Relation;

function Relation(model, type, target, keyField) {
  this.model = model;
  this.type = type;
  this.target = target;
  this.keyField = keyField;
};

Relation.prototype.find = function(params) {
  var query = getQuery.call(this);
  var source = this.model;
  var foreign = this.target;
  query = _.extend({}, params, query);

  return foreign.find(query);
};

Relation.prototype.create = function(params) {
  var query = getQuery.call(this);
  var source = this.model;
  var foreign = this.target;

  params[this.keyField] = source.id;

  return foreign.create(params);
};

Relation.prototype.delete = function() {
  var tmp = getQuery.call(this);
  var source = this.model;
  var foreign = this.target;
  var query = [];
  query[this.keyField] = source.id;

  return foreign.where(query).delete();
};

function getQuery() {
  var query = {};
  var source = this.model;
  var foreign = this.target;
  if(this.type == 'hasMany') {
    query[this.keyField] = source.id;
  } else if(this.type == 'belongsTo') {
    query.id = source._meta[this.keyField];
  }

  return query;
}
