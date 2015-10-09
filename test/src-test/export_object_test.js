'use strict';

var sinon = require('sinon');
var privateState = require('../../');
var util = require('../js/fixtures/util');

describe('PrivateState.ExportObjectTest', function() {
  afterEach(function() {
    privateState.restoreAll();
  });

  it('should mock a public function', function() {
    assert.equal(util.multiply(2, 5), 10);
  });

  it('should expose a private function to be tested', function() {
    var add = privateState.getForTesting(util, 'add');
    assert.equal(add(1, 4), 5);
  });

  it('should mock a private function', function() {
    assert.equal(util.addBase(1), 21);

    var addStub = sinon.stub().withArgs(1, 20).returns('hijacked');
    privateState.setFunctionForTesting(util, 'add', addStub);
    assert.equal(util.addBase(1), 'hijacked');
  });

  it('#restoreModule should revert a private function to the initial state', function() {
    var addStub = sinon.stub().withArgs(1, 20).returns('hijacked');
    privateState.setFunctionForTesting(util, 'add', addStub);
    assert.equal(util.addBase(1), 'hijacked');

    privateState.restoreModule(util);
    assert.equal(util.addBase(1), 21);
  });

  it('should mock a constant', function() {
    assert.equal(util.addBase(1), 21);

    privateState.setConstantForTesting(util, 'BASE', 12);
    assert.equal(util.addBase(1), 13);
  });

  it('#restoreModule should revert a constant to the initial state', function() {
    privateState.setConstantForTesting(util, 'BASE', 12);
    assert.equal(util.addBase(1), 13);

    privateState.restoreModule(util);
    assert.equal(util.addBase(1), 21);
  });
});

