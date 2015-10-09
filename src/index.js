'use strict';

var environment = require('execution-environment');

var stubbedFuncsAndConsts = [];

function getStubs() {
  return stubbedFuncsAndConsts;
}

function alreadyStubbed(stubs, newPayload) {
  return stubs.some(function(payload) {
    return (payload.mod === newPayload.mod) && (payload.name === newPayload.name);
  });
}

function addStub(stubs, payload) {
  if (!alreadyStubbed(stubs, payload)) {
    stubs.push(payload);
  }
}

function setPrivateVariable(mod, varName, varValue) {
  var newStubPayload = {
    mod: mod,
    name: varName,
    value: mod.__get__(varName)
  };

  addStub(getStubs(), newStubPayload);

  mod.__set__(varName, varValue);
}

function restoreFromPayload(payload) {
  payload.mod.__set__(payload.name, payload.value);
}

var PrivateState = {
  checkTestEnv: function() {
    if (!environment.isTest()) {
      throw new Error('PrivateState function was called outside of the test environment');
    }

    return true;
  },

  exposeForTesting: function(mod, functionNames) {
    if (environment.isTest()) {
      mod._visibleForTesting = functionNames;
    }
  },

  getForTesting: function(mod, fncName) {
    this.checkTestEnv();

    var visibleForTesting = mod._visibleForTesting;

    if (Array.isArray(visibleForTesting) && visibleForTesting.indexOf(fncName) > -1) {
      return mod.__get__(fncName);
    }

    throw new Error(fncName + ' was not exposed for testing. Please register it.');
  },

  setFunctionForTesting: function(mod, fncName, fnc) {
    this.checkTestEnv();

    if (typeof fnc !== 'function') {
      throw new Error(fncName + ' is not a function');
    }

    var visibleForTesting = mod._visibleForTesting;
    if (Array.isArray(visibleForTesting) && visibleForTesting.indexOf(fncName) > -1) {
      setPrivateVariable(mod, fncName, fnc);
      return mod;
    }

    throw new Error(fncName + ' was not exposed for testing. Please register it.');
  },

  setConstantForTesting: function(mod, constName, value) {
    this.checkTestEnv();

    if (constName === constName.toUpperCase()) {
      setPrivateVariable(mod, constName, value);
      return mod;
    }

    throw new Error(constName + ' is not a constant.');
  },

  restoreModule: function(mod) {
    getStubs()
      .filter(function(payload) {
        return mod === payload.mod;
      })
      .forEach(restoreFromPayload);
  },

  restore: function(mod) {
    this.restoreModule(mod);
  },

  restoreAll: function() {
    getStubs().forEach(restoreFromPayload);
  }
};

module.exports = PrivateState;
