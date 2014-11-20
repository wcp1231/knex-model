'use strict';
var _ = require('lodash');
var pjson = require('../package.json');
var momery = require('./momery');
var utils = require('./utils');
var Builder = require('./builder');
var methods = require('./methods');

module.exports = function(knex) {
  var Relation = require('./relation');
  var Base = require('./base');
  Base._knex = knex;

  var KenxModel = {
    VERSION: pjson.version,
    define: define,
    BaseModel: Base
  };

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

    /** save Model reference */
    model.prototype.class = model;

    /** save super class prototype reference */
    model.prototype.super = Base.prototype;

    _.extend(model.prototype, Base.prototype, prototype);
    _.extend(model, Base, classProps,{ _tableName: tableName });

    /** build `onCreate` and `onUpdate` */
    model.onCreate = definition.onCreate;
    model.onUpdate = definition.onUpdate;

    buildRelation(model, definition);

    buildKnexMethod(model);

    /** save model to momery */
    momery.set(model._name, model);

    return model;
  }

  function buildKnexMethod(model) {
    methods
      .concat(_.keys(Builder.prototype))
      .forEach(function(method) {
      model[method] = function() {
        var builder = new Builder(model);
        return builder[method].apply(builder, arguments);
      };
      });
    model.getKnex = function() {
      return new Builder(model);
    };
  }

  function buildRelation(model, definition) {
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
          var target = utils.getModel(item.model);
          return new Relation(this, type, target, item);
        });
      });
    }
  }
};
