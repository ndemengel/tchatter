describe('Message Service', function() {

  var messageService, $mockTimeout;

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

    module(function($provide) {
      function noop() {};
      $provide.value('$timeout', $mockTimeout.$timeout.bind($mockTimeout));
      $provide.value('transport', { onMessage: noop, send: noop });
    });

    inject(function($injector) {
      messageService = $injector.get('messageService');
    });

  });

  it('should post message', inject(function($httpBackend) {
    // given
    $httpBackend.expectPOST('/msg', {msg: 'Hello world'})
      .respond(200, '{"success" : true}');

    var callback = sinon.spy();

    // when
    messageService.postMessage('Hello world', callback);

    // then
    $httpBackend.flush();
    expect(callback.callCount).to.equal(1);
    expect(callback).to.have.been.calledWith(true, { success: true });
  }));

  it('should retrieve messages issued after given time', inject(function($httpBackend) {
    // given
    var aMessageId = 17;

    $httpBackend.expectGET('/msg?afterId=' + aMessageId)
      .respond(200, '[{"msg": "message 1", "id": 23, "time": 975}, {"msg": "message 2", "id": 42, "time": 1257}]');

    var callback = sinon.spy();

    // when
    messageService.getMessagesSince(aMessageId, callback);

    // then
    $httpBackend.flush();
    expect(callback.callCount).to.equal(1);
    expect(callback).to.have.been.calledWith(true, [
      {msg: "message 1", id: 23, time: 975},
      {msg: "message 2", id: 42, time: 1257}
    ]);
  }));

  it('should forward received new messages to subscribers', inject(function($httpBackend) {
    // given
    var callback = sinon.spy();

    $httpBackend.expectGET('/msg?afterId=0')
      .respond(200, '[{"msg": "message 1", "id": 23, "time": 975}, {"msg": "message 2", "id": 42, "time": 1257}]');

    // when
    messageService.onMessage(callback);

    // then
    $httpBackend.flush();
    expect(callback.callCount).to.equal(1);
    expect(callback).to.have.been.calledWith([
      {msg: "message 1", id: 23, time: 975},
      {msg: "message 2", id: 42, time: 1257}
    ]);

    // then given
    $httpBackend.expectGET('/msg?afterId=42')
      .respond(200, '[{"msg": "message 3", "id": 78, "time": 1975}]');

    // when
    $mockTimeout.trigger();

    // then
    $httpBackend.flush();
    expect(callback.callCount).to.equal(2);
    expect(callback).to.have.been.calledWith([
      {msg: "message 3", id: 78, time: 1975}
    ]);
  }));
});