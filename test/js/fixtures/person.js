'use strict';

var privateState = require('../../../');
var util = require('./util');

var AGES = [1, 2, 3];

function nameHelper(first, last) {
  return first + ' ' + last;
}

function Person(first, last) {
  this.first = first;
  this.last = last;
  this.ages = AGES;
}

Person.prototype = {
  welcome: function() {
    return 'My name is ' + nameHelper(this.first, this.last);
  },

  ageTimes10: function(age) {
    return util.multiply(10, age);
  }
};

privateState.exposeForTesting(Person, ['nameHelper']);

module.exports = Person;
