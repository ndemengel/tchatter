var ctx = require('./util/test-context'),
  controlFlow = ctx.controlFlow,
  appDriver = ctx.appDriver,
  expect = ctx.expect;

describe('Chat Page', function() {

  beforeEach(ctx.setUpTest);

  afterEach(ctx.tearDownTest);

  function strEndsWith(str, expectedEnd) {
    if (expectedEnd.length > str.length) {
      return false;
    }
    return str.substr(str.length - expectedEnd.length) === expectedEnd;
  }

  function endsWith(expectedEnd) {
    return function(actualStr) {
      return strEndsWith(actualStr, expectedEnd);
    };
  }

  it('should welcome the user', ctx.e2eTest(function() {
    // when
    appDriver().openApp();
    // then
    return expect(appDriver().getViewText()).to.eventually.equal('Welcome to Tchatter...');
  }));

  it('should display entered message in chat history', ctx.e2eTest(function() {
    // given
    appDriver().openApp();
    var USER_MESSAGE = 'Hello world';

    // when
    appDriver().sendMessage(USER_MESSAGE);

    // then
    return expect(appDriver().getHistoryContent()).to.eventually.contain(USER_MESSAGE);
  }));

  it('should stack entered messages in chat history', ctx.e2eTest(function() {
    // given
    appDriver().openApp();
    var FIRST_USER_MESSAGE = 'Hello John';
    var SECOND_USER_MESSAGE = 'How are you?';

    // when
    appDriver().sendMessage(FIRST_USER_MESSAGE);
    appDriver().sendMessage(SECOND_USER_MESSAGE);

    // then
    return expect(appDriver().getHistoryContent()).to.eventually
      .satisfy(endsWith('You : ' + FIRST_USER_MESSAGE + '\nYou : ' + SECOND_USER_MESSAGE));
  }));

  it('should display already existing messages', ctx.e2eTest(function() {
    // given
    appDriver().openApp();
    var FIRST_USER_MESSAGE = 'Hello John';
    var SECOND_USER_MESSAGE = 'How are you?';

    appDriver().sendMessage(FIRST_USER_MESSAGE);
    appDriver().sendMessage(SECOND_USER_MESSAGE);

    // when
    var newAppDriver = ctx.buildAppDriver(ctx.buildWebDriver());
    newAppDriver.openApp();

    newAppDriver.sleep(1000);

    // then
    return expect(newAppDriver.getHistoryContent()).to.eventually
      .contain('Mr pink : ' + FIRST_USER_MESSAGE + '\nMr pink : ' + SECOND_USER_MESSAGE);
  }));

});
