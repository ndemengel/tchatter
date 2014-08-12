var childProcess = require('child_process');
var path = require('path');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var webdriver = require('selenium-webdriver');
var remote = require('selenium-webdriver/remote');
var SeleniumServer = remote.SeleniumServer;

var packageDesc = require('../../../package.json');
var AppDriver = require('./driver');

// convenience pre-configuration for all tests
chai.use(chaiAsPromised);

var seleniumServer = new SeleniumServer(
  path.resolve(__dirname,
      '../../../selenium/selenium-server-standalone-' + packageDesc.webdriverVersions.selenium + '.jar'),
  { port: 4444 }
);

var appServerProcess;

// global drivers
var driver;
var drivers = [];
var appDriver;

/**
 * Should be called only once before all tests.
 */
function startSelenium(cb) {
  seleniumServer.start().then(cb);
}

/**
 * Should be called only once after all tests.
 */
function stopSelenium(cb) {
  seleniumServer.stop().then(cb);
}

/**
 * Build another Selenium driver. Useful to test concurrent access to the
 * application.
 */
function buildWebDriver() {
  var capabilities = webdriver.Capabilities.phantomjs();
  capabilities.set('phantomjs.binary.path', path.join(__dirname, '../../../node_modules/phantomjs/bin/phantomjs'));
  capabilities.set('takesScreenshot', true);

  var d = new webdriver.Builder()
    .usingServer('http://localhost:4444/wd/hub')
    .withCapabilities(capabilities)
    .build();

  drivers.push(d);

  return d;
}

/**
 * Build another app driver. Useful to test concurrent access to the
 * application.
 */
function buildAppDriver(driver) {
  return new AppDriver(driver);
}

/**
 * Build global Selenium and App Drivers. Should usually be called before each test.
 *
 * @returns {Promise}
 */
function buildDrivers() {
  driver = buildWebDriver();
  appDriver = buildAppDriver(driver);
  return webdriver.promise.fulfilled();
}

/**
 * Destroy the global Selenium Driver. Should usually be called after each test
 * (if {@link buildDrivers()} has been called before each).
 *
 * @returns {Promise}
 */
function quitDriver() {
  var promise = null;

  drivers.forEach(function(d) {
    if (promise) {
      promise.then(d.quit.bind(d));
    }
    else {
      promise = d.quit();
    }
  });

  drivers.length = 0;

  if (promise) {
    return promise;
  }
  return webdriver.promise.fulfilled();
}


function runAnsiblePlay(name) {
  var deferred = webdriver.promise.defer();
  var npmOptions = { cwd: path.join(__dirname, '..', '..', '..', 'infra') };

  var ansibleProcess = childProcess.spawn('ansible-playbook', ['-i', 'inventories/dev', name], npmOptions);

  ansibleProcess.stderr.on('data', function(data) {
    console.error('ansible: ' + data);
  });

  ansibleProcess.on('close', function(code) {
    if (code === 0) {
      deferred.fulfill();
    }
    else {
      console.error('ansible exit code: ' + code);
      deferred.reject();
    }
  });

  return deferred.promise;
}

/**
 * Start the redis server. Should usually be called before each test.
 *
 * @returns {Promise}
 */
function startRedis() {
  return runAnsiblePlay('start-test-redis-server.yml');
}

/**
 * Stop the redis server. Should usually be called after each test.
 *
 * @returns {Promise}
 */
function stopRedis() {
  return runAnsiblePlay('stop-test-redis-server.yml');
}

/**
 * Start the application. Should usually be called before each test.
 *
 * @param {Number}
 *            maybePort an optional port on which to start the application.
 *
 * @returns {Promise}
 */
function startApp(maybePort) {
  var deferred = webdriver.promise.defer();
  var npmOptions = {
    cwd: path.join(__dirname, '..', '..', '..'),
    env: {
      PATH: process.env.PATH,
      REDIS_PORT: '6380'
    }
  };

  appServerProcess = childProcess.spawn('node', ['app.js', maybePort || 9999], npmOptions);

  appServerProcess.stdout.on('data', function(data) {
    if (/^App started/.test(data)) {
      // first log has appeared, server is now up
      deferred.fulfill();
    }
    else {
      console.log('server: ' + data);
    }
  });

  appServerProcess.stderr.on('data', function(data) {
    // ignore connect's warning
    if (!/deprecated/.test(data) && !/connect.3\.0/i.test(data)) {
      console.error('server error: ' + data);
    }
  });

  return deferred.promise;
}

/**
 * Stop the application. Should usually be called after each test (if
 * {@link startApp()} has been called before each).
 *
 * @returns {Promise}
 */
function stopApp() {
  appServerProcess.kill('SIGKILL');
  return webdriver.promise.fulfilled();
}

/**
 * Convenience function to start the application and build a global Selenium
 * driver. Should usually be passed (not called) to Mocha's beforeEach hook.
 *
 * @param {Function}
 *            done to be called once the test has been set up
 * @see startApp
 * @see buildDrivers
 */
function setUpTest(done) {
  this.timeout(20000);
  startRedis()
    .then(startApp)
    .then(buildDrivers)
    .then(done)
    .thenCatch(stopApp);
}

/**
 * Convenience function to stop the application and destroy the global Selenium
 * driver. Should usually be passed (not called) to Mocha's afterEach hook (if
 * {@link setUpTest()} has been called before each).
 *
 * @param {Function}
 *            done to be called once the test has been teared down
 *
 * @see startApp
 * @see buildDrivers
 */
function tearDownTest(done) {
  this.timeout(10000);
  quitDriver()
    .then(stopApp)
    .then(stopRedis)
    .then(done);
}

function e2eTestDecorator(testFn) {
  return function(done) {
    this.timeout(10000);

    var called = false;
    function singleCallDone(maybeError) {
      if (!called) {
        try {
          done(maybeError);
        } finally {
          called = true;
        }
      }
    }

    var maybeSthToNotify = testFn.call(this);
    if (maybeSthToNotify && maybeSthToNotify.thenCatch) {
      maybeSthToNotify.thenCatch(singleCallDone);
    }

    // error or success cases, when using expect(xx).to.eventually.yy:
    else if (maybeSthToNotify && maybeSthToNotify.notify) {
      maybeSthToNotify.notify(singleCallDone);
    }

    // success cases: singleCallDone may already have been called, but it is not a problem
    webdriver.promise.controlFlow().execute(singleCallDone);
  };
}

module.exports = {
  appDriver: function() { return appDriver; },
  buildDrivers: buildDrivers,
  buildAppDriver: buildAppDriver,
  buildWebDriver: buildWebDriver,
  controlFlow: webdriver.promise.controlFlow,
  driver: function() { return driver; },
  e2eTest: e2eTestDecorator,
  expect: chai.expect,
  quitDriver: quitDriver,
  startApp: startApp,
  startSelenium: startSelenium,
  setUpTest: setUpTest,
  stopApp: stopApp,
  stopSelenium: stopSelenium,
  tearDownTest: tearDownTest
};
