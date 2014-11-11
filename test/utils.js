'use strict';

var should = require('chai').should();
var utils = require('../lib/utils');
var Model = require('../index')({});

var A = Model.define('A', {});

describe('utils', function() {
  it('`getModel` method should return defined model', function() {
    utils.getModel(A).should.equal(A);
    utils.getModel('A').should.equal(A);
  });
});
