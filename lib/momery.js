'use strict';

/** store models **/
var momery = {};

module.exports.get = function(key) {
  return momery[key];
};

module.exports.set = function(key, value) {
  return momery[key] = value;
};
