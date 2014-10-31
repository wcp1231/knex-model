'use strict';
var _ = require('lodash');
var util = require("util");

module.exports = function(knex) {
  var KenxModel = {
    VERSION: '0.0.1',
    define: define
  };

  /** store models **/
  var momery = {};

  var Base = require('./base');
  Base._knex = knex;

  return KenxModel;

  function define(name, definition) {
    if(typeof name !== 'string') {
      definition = name;
      name = '_NoName_';
    }

    var tableName = definition.tableName;
    var model = function(params) {
      Base.call(this, params);
      this._class = model;
    };
    _.extend(model.prototype, Base.prototype);
    _.extend(model, Base, { _tableName: tableName });

    momery[name] = model;

    return model;
  }
};
