'use strict';
var _ = require('lodash');

module.exports = Relation;

function Relation(model, type, target, option) {
  this.model = model;
  this.type = type;
  this.target = target;
  this.keyField = option.key;
  this.where = option.where;
}

Relation.prototype.find = function(params) {
  var query = getQuery.call(this);
  var foreign = this.target;
  query = _.extend({}, params, query);

  if(this.type === 'belongsTo' || this.type === 'hasOne') {
    return foreign().findOne(query);
  }

  return foreign().find(query);
};

Relation.prototype.findOne = function(params) {
  var query = getQuery.call(this);
  var foreign = this.target;
  query = _.extend({}, params, query);

  return foreign().findOne(query);
};

Relation.prototype.create = function(params) {

  if(this.type === 'belongsTo') {
    throw new Error('belongsTo can not create model');
  }

  var source = this.model;
  var foreign = this.target;

  params[this.keyField] = source.id;

  return foreign().create(params);
};

Relation.prototype.delete = function(params) {
  var query = getQuery.call(this);
  var foreign = this.target;
  query = _.extend({}, params, query);

  return foreign().where(query).delete();
};

function getQuery() {
  var query = {};
  var source = this.model;

  if(this.where) {
    query = this.where;
  }

  if(this.type === 'hasMany' || this.type === 'hasOne') {
    query[this.keyField] = source.id;
  } else if(this.type === 'belongsTo') {
    query.id = source._meta[this.keyField];
  }

  return query;
}
