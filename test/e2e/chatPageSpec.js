var ctx = require('./util/test-context'),
  controlFlow = ctx.controlFlow,
  appDriver = ctx.appDriver,
  expect = ctx.expect;

describe('Chat Page', function() {

  beforeEach(ctx.setUpTest);

  afterEach(ctx.tearDownTest);

  it('should welcome the user', function(done) {
    // when
    appDriver().openApp();
    // then
    expect(appDriver().getViewText()).to.eventually.equal('Welcome to Tchatter...');

    controlFlow().execute(done);
  });

  it('should display entered message in chat history', function(done) {
    // given
    appDriver().openApp();
    var USER_MESSAGE = 'Hello world';

    // when
    appDriver().sendMessage(USER_MESSAGE);
    appDriver().sleep(1000);

    // then
    expect(appDriver().getHistoryContent()).to.eventually.contain(USER_MESSAGE);

    controlFlow().execute(done);
  });

  it('should stack entered messages in chat history', function(done) {
    // given
    appDriver().openApp();
    var FIRST_USER_MESSAGE = 'Hello John';
    var SECOND_USER_MESSAGE = 'How are you ?';

    // when
    appDriver().sendMessage(FIRST_USER_MESSAGE);
    appDriver().sendMessage(SECOND_USER_MESSAGE);
    appDriver().sleep(1000);

    // then
    expect(appDriver().getHistoryContent()).to.eventually.equal(FIRST_USER_MESSAGE + '\n' + SECOND_USER_MESSAGE);

    controlFlow().execute(done);
  });

});
