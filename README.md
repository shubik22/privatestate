# privatestate
[![Build Status](https://travis-ci.org/wealthfront/privatestate.svg?branch=master)](https://travis-ci.org/wealthfront/privatestate)
[![devDependency Status](https://david-dm.org/wealthfront/privatestate/dev-status.svg)](https://david-dm.org/wealthfront/privatestate#info=devDependencies)

This module enables files written with the CommonJS module syntax to expose private functions for testing.

# getting started

In order to use this module, you must have [rewire](https://github.com/jhnns/rewire) enabled for all required modules. If you are using browserify, you should enable the browserify transform [rewireify](https://github.com/i-like-robots/rewireify). If you are using node, you should use [rewire-global](https://github.com/TheSavior/rewire-global).

# example
When writing a module, you may have private helper functions:

```
function helper() {
  return 'helper';
}

var Utils = {
  run: function() {
    return helper();
  }
};

module.exports = Utils;
```

When we write our tests, we can't access `helper` when we require our file. `privatestate` lets us access it.

Expose your function like this:
```
var privateState = require('privatestate');

function helper() {
  return 'helper';
}

var Utils = {
  run: function() {
    return helper();
  }
};

privateState.exposeForTesting(Utils, ['helper']);

module.exports = Utils;
```

In our test, we can now access our function:

```
var utils = require('./utils');
var privateState = require('privatestate');
var sinon = require('sinon');

describe('Utils', function() {
  it('should give us a function', function() {
    var helper = privateState.getForTesting(utils, 'helper');
    assert.isFunction(helper);
  });

  it('should allow us to modify our function and restore', function() {
    privateState.setFunctionForTesting(utils, 'helper', sinon.stub().returns('in test'));

    assert.equal('in test', utils.run());

    privateState.restore(utils);
  });
});
```
