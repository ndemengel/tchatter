describe('Message Service', function() {

  beforeEach(function() {
    module('app.chat');
  });

  it('should post message', inject(function(messageService, $httpBackend) {
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

  it('should retrieve messages issued after given time', inject(function(messageService, $httpBackend) {
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
});