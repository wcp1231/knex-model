'use strict';
var _ = require('lodash');
var utils = require('./utils');

module.exports = Relation;

function Relation(model, type, target, option) {
  this.model = model;
  this.type = type;
  this.target = target;
  this.keyField = option.key;
  this.where = option.where;
  this.through = option.through;
}

Relation.prototype.find = function(params) {
  var knex = this.target.call(undefined);
  var query = getQuery.call(this);
  query = _.extend({}, params, query);

  if(this.type === 'belongsTo' || this.type === 'hasOne') {
    return knex.findOne(query);
  }

  if(this.through) {
    knex = buildThrough.call(this, knex);
    delete query[this.keyField];
  }

  return knex.find(query);
};

Relation.prototype.findOne = function(params) {
  var knex = this.target.call(undefined);
  var query = getQuery.call(this);
  query = _.extend({}, params, query);

  if(this.type === 'hasMany' && this.through) {
    knex = buildThrough.call(this, knex);
    delete query[this.keyField];
  }

  return knex.findOne(query);
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
  var knex = this.target.call(undefined);
  var query = getQuery.call(this);
  query = _.extend({}, params, query);

  if(this.type === 'hasMany' && this.through) {
    knex = buildThrough.call(this, knex);
    delete query[this.keyField];
  }

  return knex.where(query).delete();
};

function buildThrough(knex) {
  var sourceId = this.model.id;
  var through = this.through;
  var throughTable = utils.getModel(through.model)._tableName;
  var throughFk = through.throughFk;
  var otherKey = through.otherKey;
  knex.whereIn(this.keyField, function() {
    this.select(otherKey).where(throughFk, sourceId).from(throughTable);
  });

  return knex;
}

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
