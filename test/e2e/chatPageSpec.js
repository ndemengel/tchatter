var appDriver = require('./driver');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

var exec = require('child_process').exec;
var app = require('../../app');

describe('Chat Page', function() {

  var server;

  beforeEach(function() {
    app.start(9999);
  });

  afterEach(app.stop);

  it('should welcome the user', function() {
    // when
    appDriver.openApp();
    // then
    expect(appDriver.getViewText()).to.eventually.equal('Welcome to Tchatter...');
  });

  it('should display entered message in chat history', function() {
    // given
    appDriver.openApp();
    var USER_MESSAGE = 'Hello world';

    // when
    appDriver.sendMessage(USER_MESSAGE);
    appDriver.wait(1000);

    // then
    expect(appDriver.getHistoryContent()).to.eventually.contain(USER_MESSAGE);
  });

  it.skip('should stack entered messages in chat history', function() {
    // given
    appDriver.openApp();
    var FIRST_USER_MESSAGE = 'Hello world';
    var SECOND_USER_MESSAGE = 'How are you ?';

    // when
    appDriver.sendMessage(FIRST_USER_MESSAGE);
    appDriver.sendMessage(SECOND_USER_MESSAGE);
    appDriver.wait(1000);

    // then
    expect(appDriver.getHistoryContent()).to.eventually.equal(FIRST_USER_MESSAGE + '\n' + SECOND_USER_MESSAGE);
  });

});
