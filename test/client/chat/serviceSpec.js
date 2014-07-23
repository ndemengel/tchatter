describe('Message Service', function() {

  var messageService, $mockTimeout, $mockTransport;

  beforeEach(module('app.chat.service'));

  beforeEach(function() {

    $mockTimeout = {
      $timeout: function(func, delay) {
        this.func = func;
      },
      trigger: function() {
        this.func.call(undefined);
      }
    };

    $mockTransport = {
      onMessage: function(cb) {
        this.messagesListeners = this.messagesListeners || [];
        this.messagesListeners.push(cb);
      },
      messageReceived: function(msg) {
        this.messagesListeners.forEach(function(listener) {
          listener(msg);
        });
      },
      send: function(msg) {
        this.lastSentMessage = msg;
      }
    };

    module(function($provide) {
      $provide.value('$timeout', $mockTimeout.$timeout.bind($mockTimeout));
      $provide.value('transport', $mockTransport);
    });

    inject(function($injector) {
      messageService = $injector.get('messageService');
    });

  });

  it('should post message', function() {
    // when
    messageService.postMessage('Hello world');

    // then
    expect($mockTransport.lastSentMessage).to.equal('Hello world');
  });

  it('should retrieve latest messages', inject(function($httpBackend) {
    // given
    $httpBackend.expectGET('/msg')
      .respond(200, '[{"msg": "message 1", "id": 23, "time": 975}, {"msg": "message 2", "id": 42, "time": 1257}]');

    var callback = sinon.spy();

    // when
    messageService.retrieveLatestMessages(callback);

    // then
    $httpBackend.flush();
    expect(callback.callCount).to.equal(2);
    expect(callback).to.have.been.calledWith({msg: "message 1", id: 23, time: 975});
    expect(callback).to.have.been.calledWith({msg: "message 2", id: 42, time: 1257});
  }));

  it('should forward received new messages to subscribers', function() {
    // given
    var subscriber1 = sinon.spy();
    messageService.onMessage(subscriber1);
    var subscriber2 = sinon.spy();
    messageService.onMessage(subscriber2);

    // when
    $mockTransport.messageReceived({type: 'message', data: '{"msg": "message 1", "id": 23, "time": 975}'});
    $mockTransport.messageReceived({type: 'message', data: '{"msg": "message 2", "id": 42, "time": 1257}'});

    // then
    expect(subscriber1.callCount).to.equal(2);
    expect(subscriber1).to.have.been.calledWith({msg: "message 1", id: 23, time: 975});
    expect(subscriber1).to.have.been.calledWith({msg: "message 2", id: 42, time: 1257});

    expect(subscriber2.callCount).to.equal(2);
    expect(subscriber2).to.have.been.calledWith({msg: "message 1", id: 23, time: 975});
    expect(subscriber2).to.have.been.calledWith({msg: "message 2", id: 42, time: 1257});
  });
});