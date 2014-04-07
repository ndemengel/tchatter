describe('Chat Module', function() {
  var messageService, $mockInterval;

  var someTimestamp = 99;

  beforeEach(module('app.chat'));

  beforeEach(inject(function($controller, $rootScope) {
    messageService = {
      messagesToReturn: [],
      getMessagesSince: function(time, cb) {
        this.requestedTime = time;
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

    $mockInterval = {
      $interval: function(func, delay) {
        this.func = func;
      },
      trigger: function() {
        this.func.call(undefined);
      }
    };

    $controller('ChatCtrl', {
      messageService: messageService,
      $scope: $rootScope,
      $interval: $mockInterval.$interval.bind($mockInterval)
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
      {msg: 'messages', time: 1},
      {msg: 'already', time: 2},
      {msg: 'present', time: 3}
    ];
    $rootScope.userMessages = alreadyPresentMessages;

    messageService.getMessagesSince = function(_time, cb) {
      cb(false, 'irrelevant error');
    };

    // when
    $mockInterval.trigger();

    // then
    expect($rootScope.userMessages).to.deep.equal(alreadyPresentMessages);
  }));

  it("should only request new messages", inject(function($rootScope) {
    // given a first bag of messages has been received
    var firstBagOfMessages = [
      {msg: 'message 1', time: 1},
      {msg: 'message 2', time: 2}
    ];
    messageService.willReturnMessages(firstBagOfMessages);
    $mockInterval.trigger();

    // given a new bag of messages is ready to be queried
    var secondBagOfMessages = [
      {msg: 'message 3', time: 3},
      {msg: 'message 4', time: 4}
    ];
    messageService.willReturnMessages(secondBagOfMessages);

    // when
    $mockInterval.trigger();

    // then
    expect(messageService.requestedTime).to.equal(2);
    expect($rootScope.userMessages).to.deep.equal(firstBagOfMessages.concat(secondBagOfMessages));
  }));
});
