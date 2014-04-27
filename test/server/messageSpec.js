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
  }

  function getJsonData() {
    return JSON.parse(response._getData());
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

  function resetMockResponse() {
    response = httpMocks.createResponse();
  }

  beforeEach(function() {
    resetMockResponse();
  });

  it('should accept messages', function() {
    // given
    var request = requestWithBody({ msg: 'Hello World' });

    // when
    messageService.postMessage(request, response);

    // then
    expectJson({ success: true });
  });

  it('should only return messages received after requested id', function() {
    // given existing messages
    postMessage('Message 1');
    postMessage('Message 2');
    postMessage('Message 3');
    resetMockResponse();

    // when querying messages
    var request = requestWithParams({ afterId: 0 });
    messageService.getLastMessagesSince(request, response);

    // then
    expectJson();
    var firstMessages = getJsonData();
    expect(firstMessages).to.have.length(3);
    expect(firstMessages[0].msg).to.equal('Message 1');
    expect(firstMessages[1].msg).to.equal('Message 2');
    expect(firstMessages[2].msg).to.equal('Message 3');

    // given some new messages
    postMessage('Message 4');
    postMessage('Message 5');

    // when querying new messages
    resetMockResponse();
    request = requestWithParams({ afterId: firstMessages[2].id });
    messageService.getLastMessagesSince(request, response);

    // then
    expectJson();
    var newMessages = getJsonData();
    expect(newMessages).to.have.length(2);
    expect(newMessages[0].msg).to.equal('Message 4');
    expect(newMessages[1].msg).to.equal('Message 5');
  });

  it('should return all messages when no id is given', function() {
    // given existing messages
    postMessage('Message 1');
    postMessage('Message 2');
    resetMockResponse();

    // when querying messages without time
    var request = requestWithParams();
    messageService.getLastMessagesSince(request, response);

    // then
    expectJson();
    var messages = getJsonData();
    expect(messages).to.have.length(2);
    expect(messages[0].msg).to.equal('Message 1');
    expect(messages[1].msg).to.equal('Message 2');
  });

});