'use strict';

var chai = require('chai');
chai.config.includeStack = true;

var sinon = require('sinon');
sinon.assert.expose(chai.assert, {
  prefix: ''
});

if (typeof(window) === 'undefined') {
  global.assert = chai.assert;
  require('rewire-global').enable();
  process.env.NODE_ENV = 'test';
} else {
  window.assert = chai.assert;
}
