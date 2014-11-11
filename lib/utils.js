'use strict';

var Base = require('./base');
var momery = require('./momery');

module.exports.getModel = function(model) {
  if(typeof model === 'string') {
    return momery.get(model);
  }
  if(typeof model === 'function' && isSubclassOfBase(model)) {
    return model;
  }
  throw new Error('Invalid model!');
};

function isSubclassOfBase(model) {
  return model.prototype.super === Base.prototype;
}
