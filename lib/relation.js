'use strict';
var _ = require('lodash');

module.exports = Relation;

function Relation(model, type, target, keyField) {
  this.model = model;
  this.type = type;
  this.target = target;
  this.keyField = keyField;
};

Relation.prototype.find = function() {
  var tmp = getSourceAndForeign.call(this);
  var source = tmp.source;
  var foreign = tmp.foreign;
  var query = {};
  query[this.keyField] = source.id;

  return foreign.find(query);
};

Relation.prototype.create = function(params) {
  var tmp = getSourceAndForeign.call(this);
  var source = tmp.source;
  var foreign = tmp.foreign;

  params[this.keyField] = source.id;

  return foreign.create(params);
};

Relation.prototype.delete = function() {
  var tmp = getSourceAndForeign.call(this);
  var source = tmp.source;
  var foreign = tmp.foregin;
  var query = [];
  query[this.keyField] = source.id;

  return foreign.where(query).delete();
};

function getSourceAndForeign() {
  var source = undefined;
  var foreign = undefined;
  if(this.type == 'hasMany') {
    source = this.model;
    foreign = this.target;
  } else if(this.type == 'belongsTo') {}

  return {
    source: source,
    foreign: foreign
  };
}
