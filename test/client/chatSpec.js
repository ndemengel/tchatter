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
      onMessage: function(cb) {
        this.subscriberRegisteredForNewMessages = true;
        this.messageListener = cb;
      },
      postMessage: function(msg, _cb) {
        this.postedMessage = msg;
      },
      receivesMessages: function(messages) {
        this.messageListener(messages);
      },
      willReturnMessages: function(messages) {
        this.messagesToReturn = messages;
      }
    };

    $mockTimeout = {
      $timeout: function(func, _delay) {
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

  it("should listen for messages upon instantiation", function() {
    expect(messageService.subscriberRegisteredForNewMessages).to.equal(true);
  });

  it("should update displayed messages when new messages are received", inject(function($rootScope) {
    // given
    var alreadyPresentMessages = [
      {msg: 'messages', time: 100, id: 1},
      {msg: 'already', time: 200, id: 2},
      {msg: 'present', time: 300, id: 3}
    ];
    $rootScope.userMessages = alreadyPresentMessages;

    // when
    var newMessages = [
      {msg: 'and', time: 400, id: 4},
      {msg: 'more', time: 500, id: 5}
    ];
    messageService.receivesMessages(newMessages);

    // then
    expect($rootScope.userMessages).to.deep.equal(alreadyPresentMessages.concat(newMessages));
  }));
});
