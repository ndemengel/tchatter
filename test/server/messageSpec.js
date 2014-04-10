var expect = require('chai').expect,
  httpMocks = require('node-mocks-http'),
  proxyquire = require('proxyquire').noPreserveCache();

describe('Message Service (REST)', function() {

  var messageService, response;

  beforeEach(function() {
    messageService = proxyquire('../../lib/message', {
      './db': { messages: [] }
    });
  });

  function expectJson(expected) {
    expect(response.statusCode).to.equal(200);
    expect(response._isJSON()).to.equal(true);

    var data = JSON.parse(response._getData());

    // optionally expect something right now
    if (expected) {
      expect(data).to.deep.equal(expected);
    }

    // allow for future expectations on data
    return data;
  }

  function requestWithBody(body) {
    return httpMocks.createRequest({ body: body });
  }

  function requestWithParams(params) {
    var request = httpMocks.createRequest({ params: params });
    request.param = function(key, defaultVal) {
      return this.params[key] || defaultVal;
    };
    return request;
  }

  function postMessage(msg) {
    messageService.postMessage(requestWithBody({ msg: msg }), response);
  }

  function resetResponse() {
    response = httpMocks.createResponse();
  }

  beforeEach(function() {
    resetResponse();
  });

  it('should accept messages', function() {
    // given
    var request = requestWithBody({ msg: 'Hello World' });

    // when
    messageService.postMessage(request, response);

    // then
    expectJson({ success: true });
  });

  it.skip('should only return messages received after requested time', function() {
    // given existing messages
    postMessage('Message 1');
    postMessage('Message 2');
    postMessage('Message 3');
    resetResponse();

    // when querying messages
    var request = requestWithParams({ sinceTime: 0 });
    messageService.getLastMessagesSince(request, response);

    // then
    var firstMessages = expectJson();
    expect(firstMessages).to.have.length(3);
    expect(firstMessages).to.have.deep.property('[0].msg', 'Message 1');
    expect(firstMessages).to.have.deep.property('[1].msg', 'Message 2');
    expect(firstMessages).to.have.deep.property('[2].msg', 'Message 3');

    // given some new messages
    postMessage('Message 4');
    postMessage('Message 5');

    // when querying new messages
    resetResponse();
    request = requestWithParams({ sinceTime: firstMessages[2].time });
    messageService.getLastMessagesSince(request, response);

    // then
    var newMessages = expectJson();
    expect(newMessages).to.have.length(2);
    expect(newMessages).to.have.deep.property('[0].msg', 'Message 3');
    expect(newMessages).to.have.deep.property('[1].msg', 'Message 4');
  });

  it.skip('should return all messages when no time is given', function() {
    // given existing messages
    postMessage('Message 1');
    postMessage('Message 2');
    resetResponse();

    // when querying messages without time
    var request = requestWithParams();
    messageService.getLastMessagesSince(request, response);

    // then
    expectJson()
      .to.have.length(2)
      .to.have.deep.property('[0].msg', 'Message 1')
      .to.have.deep.property('[1].msg', 'Message 2');
  });

});