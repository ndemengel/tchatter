angular.module('app.chat.transport', [])

  .factory('transport', function() {

    var messageListeners = [];

    var sock = new SockJS('http://localhost:8080/chat');

    sock.onmessage = function(e) {
      messageListeners.forEach(function(fn) {
        fn(e);
      });
    };

    return {
      onMessage: function(fn) {
        messageListeners.push(fn);
      },
      send: function(msg) {
        sock.send(msg);
      }
    };
  });