'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var assign = Object.assign || require('object.assign');

describe('WfModules.index', function() {
  var environmentStub;
  var moduleStub;
  var additionStub;
  var testingFunctions;
  var privateState;

  function createStubPayload(mod, name, value) {
    return {
      mod: mod,
      name: name,
      value: value
    };
  }

  beforeEach(function() {
    environmentStub = {};
    moduleStub = {
      __get__: function(name) {
        return this[name];
      },

      __set__: function(name, fnc) {
        this[name] = fnc;
      }
    };
    additionStub = sinon.stub();
    testingFunctions = ['add', 'multiply'];

    privateState = proxyquire('../../', {
      'execution-environment': environmentStub
    });
  });

  describe('#checkTestEnv', function() {
    it('should throw if outside of test', function() {
      environmentStub.isTest = sinon.stub().returns(false);

      assert.throws(function() {
        privateState.checkTestEnv();
      }, /PrivateState function was called outside of the test environment/);
    });

    it('should not throw if outside of test', function() {
      environmentStub.isTest = sinon.stub().returns(true);
      assert.isTrue(privateState.checkTestEnv());
    });
  });

  describe('#exposeForTesting', function() {
    it('should expose the specified function when in test environment', function() {
      environmentStub.isTest = sinon.stub().returns(true);

      privateState.exposeForTesting(moduleStub, testingFunctions);
      assert.deepEqual(moduleStub._visibleForTesting, testingFunctions);
    });

    it('should not expose any functions when not in test environment', function() {
      environmentStub.isTest = sinon.stub().returns(false);

      privateState.exposeForTesting(moduleStub, testingFunctions);
      assert.equal(moduleStub._visibleForTesting, undefined);
    });
  });

  describe('#getForTesting', function() {
    it('should return the function when in test environment and function has been exposed', function() {
      environmentStub.isTest = sinon.stub().returns(true);

      var stub = sinon.stub(moduleStub, '__get__').returns(additionStub);

      privateState.exposeForTesting(moduleStub, ['add']);
      assert.equal(privateState.getForTesting(moduleStub, 'add'), additionStub);
      assert.calledWithExactly(stub, 'add');
    });

    it('should throw when in test environment and function has not been exposed', function() {
      environmentStub.isTest = sinon.stub().returns(true);

      assert.throws(function() {
        privateState.getForTesting(moduleStub, 'add');
      }, /add was not exposed for testing/);
    });

    it('should throw when not in test environment', function() {
      environmentStub.isTest = sinon.stub().returns(false);

      assert.throws(function() {
        privateState.getForTesting(moduleStub, 'add');
      }, /PrivateState function was called outside of the test environment/);
    });
  });

  describe('#setFunctionForTesting', function() {
    it('should set the function when in test environment and function has been exposed', function() {
      var stub = sinon.stub();

      function setPrivateVariableStub(mod, fncName, fnc) {
        assert.equal(mod, moduleStub);
        assert.equal(fncName, 'add');
        assert.equal(fnc, stub);
        return mod;
      }

      privateState.__set__('setPrivateVariable', setPrivateVariableStub);
      environmentStub.isTest = sinon.stub().returns(true);

      privateState.exposeForTesting(moduleStub, ['add']);
      assert.equal(privateState.setFunctionForTesting(moduleStub, 'add', stub), moduleStub);
    });

    it('should throw when in test environment and function has not been exposed', function() {
      environmentStub.isTest = sinon.stub().returns(true);

      assert.throws(function() {
        privateState.setFunctionForTesting(moduleStub, 'add', sinon.stub());
      }, /add was not exposed for testing/);
    });

    it('should throw when not in test environment', function() {
      environmentStub.isTest = sinon.stub().returns(false);

      assert.throws(function() {
        privateState.setFunctionForTesting(moduleStub, 'add', sinon.stub());
      }, /PrivateState function was called outside of the test environment/);
    });

    it('should throw if setting something other than a function', function() {
      var someValue = 10;
      environmentStub.isTest = sinon.stub().returns(true);
      assert.throws(function() {
        privateState.setFunctionForTesting(moduleStub, 'add', someValue);
      }, /is not a function/);
    });
  });

  describe('#setConstantForTesting', function() {
    it('should stub a constant', function() {
      var bounds = [1, 2, 3, 4];

      function setPrivateVariableStub(mod, fncName, fnc) {
        assert.equal(mod, moduleStub);
        assert.equal(fncName, 'BOUNDARIES');
        assert.equal(fnc, bounds);
        return mod;
      }

      privateState.__set__('setPrivateVariable', setPrivateVariableStub);
      environmentStub.isTest = sinon.stub().returns(true);

      assert.equal(privateState.setConstantForTesting(moduleStub, 'BOUNDARIES', bounds), moduleStub);
    });

    it('should throw if stubbing a non-constant', function() {
      environmentStub.isTest = sinon.stub().returns(true);
      assert.throws(function() {
        privateState.setConstantForTesting(moduleStub, 'someVariable', 10);
      }, /is not a constant/);
    });

    it('should throw if not in test environment', function() {
      environmentStub.isTest = sinon.stub().returns(false);
      assert.throws(function() {
        privateState.setConstantForTesting(moduleStub, 'someVariable', 10);
      }, /PrivateState function was called outside of the test environment/);
    });
  });

  describe('#setPrivateVariable', function() {
    it('should cache the old value and set the new value', function() {
      var setPrivateVariable = privateState.__get__('setPrivateVariable');
      var getprivateStateStubs = privateState.__get__('getStubs');
      var foo = sinon.stub();
      var stubFunc = sinon.stub();
      var aModule = assign({
        foo: foo
      }, moduleStub);
      var getStub = sinon.stub(aModule, '__get__').returns(foo);
      var setSpy = sinon.spy(aModule, '__set__');

      setPrivateVariable(aModule, 'foo', stubFunc);

      assert.calledOnce(getStub);
      assert.calledWithExactly(getStub, 'foo');
      assert.calledWithExactly(setSpy, 'foo', stubFunc);
      var payload = createStubPayload(aModule, 'foo', foo);

      assert.deepEqual(getprivateStateStubs()[0], payload);
    });

    it('should only cache the original value', function() {
      var setPrivateVariable = privateState.__get__('setPrivateVariable');
      var getprivateStateStubs = privateState.__get__('getStubs');
      var foo = sinon.stub();
      var stubFunc = sinon.stub();
      var aModule = assign({
        foo: foo
      }, moduleStub);

      setPrivateVariable(aModule, 'foo', stubFunc);
      setPrivateVariable(aModule, 'foo', {});

      assert.equal(getprivateStateStubs().length, 1);
    });
  });

  describe('#restoreModule', function() {
    it('should restore the private values that were overwritten', function() {
      var foo = sinon.stub();
      var fooStub = sinon.stub();
      var fooModule = assign({
        SOME_CONSTANT: 'Homestar',
        foo: foo
      }, moduleStub);
      privateState.exposeForTesting(fooModule, ['foo']);

      privateState.setFunctionForTesting(fooModule, 'foo', fooStub);
      privateState.setConstantForTesting(fooModule, 'SOME_CONSTANT', 'Strong Bad');
      assert.equal(fooModule.foo, fooStub);
      assert.equal(fooModule.SOME_CONSTANT, 'Strong Bad');

      privateState.restoreModule(fooModule);
      assert.equal(fooModule.foo, foo);
      assert.equal(fooModule.SOME_CONSTANT, 'Homestar');
    });
  });

  describe('#restore', function() {
    it('is deprecated and should just call restoreModule', function() {
      var restoreSpy = sinon.spy(privateState, 'restoreModule');
      privateState.restore(moduleStub);

      assert.calledWithExactly(restoreSpy, moduleStub);
    });
  });

  describe('#restoreFromPayload', function() {
    it('should restore the property via __set__', function() {
      var restoreFromPayload = privateState.__get__('restoreFromPayload');
      var payload = createStubPayload(moduleStub, 'payloadOne', 'stubOne');
      var setSpy = sinon.spy(payload.mod, '__set__');

      restoreFromPayload(payload);
      assert.calledWithExactly(setSpy, payload.name, payload.value);
    });
  });

  describe('#restoreAll', function() {
    it('should restore all private values to all modules that were overwritten', function() {
      var foo = sinon.stub();
      var fooStub = sinon.stub();
      var fooModule = assign({
        SOME_CONSTANT: 'Homestar',
        foo: foo
      }, moduleStub);
      privateState.exposeForTesting(fooModule, ['foo']);

      var bar = sinon.stub();
      var barStub = sinon.stub();
      var barModule = assign({
        bar: bar
      }, moduleStub);
      privateState.exposeForTesting(barModule, ['bar']);

      privateState.setFunctionForTesting(fooModule, 'foo', fooStub);
      privateState.setConstantForTesting(fooModule, 'SOME_CONSTANT', 'Strong Bad');
      privateState.setFunctionForTesting(barModule, 'bar', barStub);
      assert.equal(fooModule.foo, fooStub);
      assert.equal(fooModule.SOME_CONSTANT, 'Strong Bad');
      assert.equal(barModule.bar, barStub);

      privateState.restoreAll();
      assert.equal(fooModule.foo, foo);
      assert.equal(fooModule.SOME_CONSTANT, 'Homestar');
      assert.equal(barModule.bar, bar);
    });
  });

  describe('handling stubbed functions and constants', function() {
    var mod1 = {
      name: 'one'
    };
    var mod2 = {
      name: 'two'
    };
    var payload1 = createStubPayload(mod1, 'payloadOne', 'stubOne');
    var payload2 = createStubPayload(mod2, 'payloadTwo', 'stubOne');
    var payload3 = createStubPayload(mod1, 'payloadThree', 'stubThree');

    it('#alreadyStubbed should return true if a function or value has been stubbed', function() {
      var alreadyStubbed = privateState.__get__('alreadyStubbed');
      var stubs = [payload1, payload2, payload3];

      assert.isTrue(alreadyStubbed(stubs, payload1));
      assert.isTrue(alreadyStubbed(stubs, payload2));
      assert.isTrue(alreadyStubbed(stubs, payload3));
      assert.isFalse(alreadyStubbed([payload1, payload2], payload3));
      assert.isFalse(alreadyStubbed([], payload1));
    });

    describe('#addStub', function() {
      var addStub;
      var stubs;

      beforeEach(function() {
        addStub = privateState.__get__('addStub');
        stubs = [payload1];
      });

      it('#addStub should add the stub if it has not alraedy been stubbed', function() {
        addStub(stubs, payload2);
        assert.equal(stubs.length, 2);
        assert.isTrue(stubs.indexOf(payload1) > -1);
        assert.isTrue(stubs.indexOf(payload2) > -1);
      });

      it('#addStub should not add the stub if it has not alraedy been stubbed', function() {
        addStub(stubs, payload1);
        assert.equal(stubs.length, 1);
        assert.isTrue(stubs.indexOf(payload1) > -1);
      });
    });
  });
});
