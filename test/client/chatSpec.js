describe('Chat Module', function() {
  var messageService, $mockTimeout;

  beforeEach(module('app.chat'));

  beforeEach(inject(function($controller, $rootScope) {
    messageService = {
      messagesToReturn: [],
      getMessagesSince: function(lastId, cb) {
        this.givenLastId = lastId;
        this.messagesRetrieved = true;
        cb(true, this.messagesToReturn);
      },
      postMessage: function(msg, cb) {
        this.postedMessage = msg;
      },
      willReturnMessages: function(messages) {
        this.messagesToReturn = messages;
      }
    };

    $mockTimeout = {
      $timeout: function(func, delay) {
        this.func = func;
      },
      trigger: function() {
        this.func.call(undefined);
      }
    };

    $controller('ChatCtrl', {
      messageService: messageService,
      $scope: $rootScope,
      $timeout: $mockTimeout.$timeout.bind($mockTimeout)
    });
  }));

  it('should properly provide a welcome message', inject(function(welcomeMessage) {
    expect(welcomeMessage()).to.match(/welcome/i);
  }));

  it('should post user message upon submit', inject(function($rootScope) {
    // given
    $rootScope.userMessage = 'some message';
    // when
    $rootScope.submitMessage();

    // then
    expect(messageService.postedMessage).to.equal('some message');
  }));

  it("should retrieve existing messages upon instantiation", function() {
    expect(messageService.messagesRetrieved).to.equal(true);
  });

  it("should not update displayed messages when new messages couldn't be retrieved", inject(function($rootScope) {
    // given
    var alreadyPresentMessages = [
      {msg: 'messages', time: 100, id: 1},
      {msg: 'already', time: 200, id: 2},
      {msg: 'present', time: 300, id: 3}
    ];
    $rootScope.userMessages = alreadyPresentMessages;

    messageService.getMessagesSince = function(_lastId, cb) {
      cb(false, 'irrelevant error');
    };

    // when
    $mockTimeout.trigger();

    // then
    expect($rootScope.userMessages).to.deep.equal(alreadyPresentMessages);
  }));

  it("should only request new messages", inject(function($rootScope) {
    // given a first bag of messages has been received
    var firstBagOfMessages = [
      {msg: 'message 1', time: 100, id: 1},
      {msg: 'message 2', time: 200, id: 2}
    ];
    messageService.willReturnMessages(firstBagOfMessages);
    $mockTimeout.trigger();

    // given a new bag of messages is ready to be queried
    var secondBagOfMessages = [
      {msg: 'message 3', time: 300, id: 3},
      {msg: 'message 4', time: 400, id: 4}
    ];
    messageService.willReturnMessages(secondBagOfMessages);

    // when
    $mockTimeout.trigger();

    // then
    expect(messageService.givenLastId).to.equal(2);
    expect($rootScope.userMessages).to.deep.equal(firstBagOfMessages.concat(secondBagOfMessages));
  }));
});
