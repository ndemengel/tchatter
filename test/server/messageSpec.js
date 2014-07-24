var chai = require('chai'),
  EventEmitter = require('events').EventEmitter,
  expect = chai.expect,
  httpMocks = require('node-mocks-http'),
  proxyquire = require('proxyquire').noCallThru().noPreserveCache(),
  sinon = require('sinon');

chai.use(require('sinon-chai'));

describe('Message Service', function() {

  var messageService;
  var mockStorage;

  beforeEach(function() {
    mockStorage = {
      messages: [],
      messageListeners: [],
      publish: function(message) {
        this.messages.push(message);
        this.messageListeners.forEach(function(listener) {
          listener(message);
        });
      },
      onMessage: function(cb) {
        this.messageListeners.push(cb);
      },
      fetchLatestMessages: function(cb) {
        cb(this.messages);
      }
    };

    messageService = proxyquire('../../lib/message', {
      './storage': mockStorage
    });
  });

  describe('REST endpoint', function() {

    var response;

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

    function request() {
      return httpMocks.createRequest();
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

    it('should return latest messages', function() {
      // given existing messages
      postMessage('Message 1');
      postMessage('Message 2');
      postMessage('Message 3');
      resetMockResponse();

      // when querying messages
      messageService.getLatestMessages(request(), response);

      // then
      expectJson();
      var messages = getJsonData();
      expect(messages).to.have.length(3);
      expect(messages[0].msg).to.equal('Message 1');
      expect(messages[1].msg).to.equal('Message 2');
      expect(messages[2].msg).to.equal('Message 3');

      // given some new messages
      postMessage('Message 4');
      postMessage('Message 5');

      // when querying new messages
      resetMockResponse();
      messageService.getLatestMessages(request(), response);

      // then
      expectJson();
      messages = getJsonData();
      expect(messages).to.have.length(5);
      expect(messages[0].msg).to.equal('Message 1');
      expect(messages[1].msg).to.equal('Message 2');
      expect(messages[2].msg).to.equal('Message 3');
      expect(messages[3].msg).to.equal('Message 4');
      expect(messages[4].msg).to.equal('Message 5');
    });

    it('should return all messages when no id is given', function() {
      // given existing messages
      postMessage('Message 1');
      postMessage('Message 2');
      resetMockResponse();

      // when querying messages without time
      messageService.getLatestMessages(request(), response);

      // then
      expectJson();
      var messages = getJsonData();
      expect(messages).to.have.length(2);
      expect(messages[0].msg).to.equal('Message 1');
      expect(messages[1].msg).to.equal('Message 2');
    });

  });

  describe('SockJS endpoint', function() {

    function mockSocket() {
      return new EventEmitter();
    }

    function mockConnection(connectionId, userColor) {
      var conn = new EventEmitter();
      conn.id = connectionId;
      conn.url = '/chat/' + userColor + '/j0evg2lj/websocket';
      conn.write = sinon.spy();
      return conn;
    }

    function jsonContaining(expected) {
      return sinon.match(function(string) {
        var actual = JSON.parse(string);
        return sinon.match(expected).test(actual);
      }, JSON.stringify(expected));
    }

    it('should welcome new users', function() {
      // given
      var socket = mockSocket();
      var connection = mockConnection('id1', 'somecolor');

      // when
      messageService.listenToSocket(socket);
      socket.emit('connection', connection);

      // then
      expect(connection.write).to.have.been.calledWithMatch(
        jsonContaining({ event: 'welcome', type: 'userState', user: 'somecolor'}));
    });

    it('should forward messages from other users', function() {
      // given a user is connected
      var socket = mockSocket();
      var connection = mockConnection('id1', 'somecolor');
      messageService.listenToSocket(socket);
      socket.emit('connection', connection);

      // when
      var message = { msg: 'Hello world', type: 'userMessage', user: 'blue'};
      mockStorage.publish(message);

      // then
      expect(connection.write).to.have.been.calledWithMatch(jsonContaining(message));
    });
  });
});