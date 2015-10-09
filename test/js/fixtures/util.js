'use strict';

var privateState = require('../../../');
var keys = require('./keys');

var BASE = 20;
var privateVariable = 1000; // eslint-disable-line

function add(num1, num2) {
  return num1 + num2;
}

var Utils = {
  addBase: function(num) {
    return add(num, BASE);
  },

  multiply: function(a, b) {
    return a * b;
  },

  convertKeyCode: function(keyCode) {
    return keys[keyCode];
  }
};

privateState.exposeForTesting(Utils, ['add']);

module.exports = Utils;
