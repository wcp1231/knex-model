'use strict';
var _ = require('lodash');

module.exports = function(knex) {
  var KenxModel = {
    VERSION: '0.0.5',
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
    };

    model._name = name;

    model.prototype.class = model;

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
      buildRelation('hasMany', definition.hasMany);
    }

    if(definition.belongsTo) {
      buildRelation('belongsTo', definition.belongsTo);
    }

    if(definition.hasOne) {
      buildRelation('hasOne', definition.hasOne);
    }

    function buildRelation(type, options) {
      options = _.isArray(options) ? options : [ options ];
      _.each(options, function(item) {
        var name = item.name || item.model;
        proto.__defineGetter__(name, function() {
          var target = momery[item.model];
          return new Relation(this, type, target, item.key, item.where);
        });
      });
    }
  }
};
