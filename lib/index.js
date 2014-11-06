'use strict';
var _ = require('lodash');
var util = require("util");

module.exports = function(knex) {
  var KenxModel = {
    VERSION: '0.0.3',
    define: define
  };

  /** store models **/
  var momery = {};

  var Relation = require('./relation');
  var Base = require('./base');
  Base._knex = knex;

  return KenxModel;

  function define(name, definition, prototype, classProps) {
    if(typeof name !== 'string') {
      definition = name;
      name = '_NoName_';
    }

    var tableName = definition.tableName;
    var model = function(params) {
      Base.call(this, params);
      this.__proto__.class = model;
    };

    model._name = name;

    // save super class prototype
    model.prototype.super = Base.prototype;

    _.extend(model.prototype, Base.prototype, prototype);
    _.extend(model, Base, classProps,{ _tableName: tableName });

    relationBuilder(model, definition);

    momery[model._name] = model;

    return model;
  }

  function relationBuilder(model, definition) {
    var proto = model.prototype;

    if(definition.hasMany) {
      var hasMany = definition.hasMany;
      hasMany = _.isArray(hasMany) ? hasMany : [ hasMany ];
      _.each(hasMany, function(item) {
        var name = item.name || item.model;
        proto.__defineGetter__(name, function() {
          var target = momery[item.model];
          return new Relation(this, 'hasMany', target, item.key, item.where);
        });
      });
    }

    if(definition.belongsTo) {
      var belongsTo = definition.belongsTo;
      belongsTo = _.isArray(belongsTo) ? belongsTo : [ belongsTo ];
      _.each(belongsTo, function(item) {
        var name = item.name || item.model;
        proto.__defineGetter__(name, function() {
          var target = momery[item.model];
          return new Relation(this, 'belongsTo', target, item.key, item.where);
        });
      });
    }

    if(definition.hasOne) {
      var hasOne = definition.hasOne;
      hasOne = _.isArray(hasOne) ? hasOne : [ hasOne ];
      _.each(hasOne, function(item) {
        var name = item.name || item.model;
        proto.__defineGetter__(name, function() {
          var target = momery[item.model];
          return new Relation(this, 'hasOne', target, item.key, item.where);
        });
      });
    }
  }
};
