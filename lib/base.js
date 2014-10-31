'use strict';
var _ = require('lodash');

module.exports = Base;

function Base(params) {
  this._meta = params;
  this.id = params.id;
};
