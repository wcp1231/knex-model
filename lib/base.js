'use strict';

module.exports = Base;

function Base(params) {
  this._meta = params;
  this.id = params.id;
}

Base.new = function() {
  var obj = Object.create(this.prototype);
  return this.apply(obj, arguments), obj;
};

Base.prototype.delete = function() {
  var _class = this.__proto__.class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).delete();
};

Base.prototype.update = function(params) {
  var _class = this.__proto__.class;
  var knex = _class._knex(_class._tableName);
  return knex.where('id', this.id).update(params);
};

Base.prototype.toJSON = function() {
  return this._meta;
};
