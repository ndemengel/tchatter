describe('Message Service', function() {

  beforeEach(function() {
    module('app.chat');
  });

  it('should post message', inject(function(messageService, $httpBackend) {
    // given
    $httpBackend.expectPOST('/msg', {msg: 'Hello world'})
      .respond(200, '{"success" : true}');

    // when
    messageService.postMessage('Hello world');

    // then
    $httpBackend.flush();
  }));

  it('should retrieve messages issued after given time', inject(function(messageService, $httpBackend) {
    // given
    var aTimestamp = 17;

    $httpBackend.expectGET('/msg?sinceTime=' + aTimestamp)
      .respond(200, '[{"msg": "message 1", "time": 23}, {"msg": "message 2", "time": 42}]');

    // when
    messageService.getMessagesSince(aTimestamp);

    // then
    $httpBackend.flush();
  }));
});