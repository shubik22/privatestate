'use strict';

var privateState = require('../../../');

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
  }
};

privateState.exposeForTesting(Utils, ['add']);

module.exports = Utils;
