'use strict';

var sinon = require('sinon');
var privateState = require('../../');
var Person = require('../js/fixtures/person');

describe('privateState.ExportClassTest', function() {
  beforeEach(function() {
    this.homestar = new Person('Homestar', 'Runner');
  });

  afterEach(function() {
    privateState.restoreAll();
  });

  it('should mock a public function', function() {
    assert.equal(this.homestar.welcome(), 'My name is Homestar Runner');
  });

  it('should expose a private function to be tested', function() {
    var nameHelper = privateState.getForTesting(Person, 'nameHelper');
    assert.equal(nameHelper('Mike', 'Jones'), 'Mike Jones');
  });

  it('should mock a private function', function() {
    var nameHelperStub = sinon.stub().withArgs('Homestar', 'Runner').returns('Strong Mad');
    privateState.setFunctionForTesting(Person, 'nameHelper', nameHelperStub);

    assert.equal(this.homestar.welcome(), 'My name is Strong Mad');
  });

  it('#restoreModule should revert a private function to the initial state', function() {
    var nameHelperStub = sinon.stub().withArgs('Homestar', 'Runner').returns('Strong Mad');
    privateState.setFunctionForTesting(Person, 'nameHelper', nameHelperStub);
    assert.equal(this.homestar.welcome(), 'My name is Strong Mad');

    privateState.restoreModule(Person);
    assert.equal(this.homestar.welcome(), 'My name is Homestar Runner');
  });

  it('should mock a constant', function() {
    assert.deepEqual(this.homestar.ages, [1, 2, 3]);

    privateState.setConstantForTesting(Person, 'AGES', ['a', 'b', 'c']);

    this.newstar = new Person('Homestar', 'Runner');
    assert.deepEqual(this.newstar.ages, ['a', 'b', 'c']);
  });

  it('#restoreModule should revert a constant to the initial state', function() {
    privateState.setConstantForTesting(Person, 'AGES', ['a', 'b', 'c']);
    var oldstar = new Person('Homestar', 'Runner');
    assert.deepEqual(oldstar.ages, ['a', 'b', 'c']);

    privateState.restoreModule(Person);
    var newstar = new Person('Homestar', 'Runner');
    assert.deepEqual(newstar.ages, [1, 2, 3]);
  });
});
