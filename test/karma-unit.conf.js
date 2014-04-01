module.exports = function(config) {
  config.set({
    files : [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'app/scripts/homePages.js',
      'app/scripts/app.js',
      'test/unit/**/*.js'
    ],
    basePath: '../',
    frameworks: ['chai', 'chai-as-promised', 'mocha', 'sinon', 'sinon-chai'],
    reporters: ['progress'],
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],
    autoWatch: false,
    singleRun: true,
    colors: true
  });
};
