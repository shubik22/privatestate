'use strict';

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'browserify'],

    files: [
      'test/js/setup.js',
      'test/src-test/**/*.js'
    ],
    preprocessors: {
      'test/js/setup.js': ['browserify'],
      'test/src-test/**/*.js': ['browserify']
    },

    browserify: {
      transform: [
        'rewireify',
        ['envify', {
          NODE_ENV: process.env.NODE_ENV
        }]
      ],
      plugin: ['proxyquire-universal'],
      debug: true
    },

    browsers: ['Chrome'],

    reporters: ['dots'],
    logLevel: 'error',
    autoWatch: false,
    singleRun: true
  });
};
