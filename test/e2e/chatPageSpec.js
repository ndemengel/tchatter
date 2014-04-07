var appDriver = require('./driver');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Chat Page', function() {

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

});
