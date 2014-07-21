angular.module('app.chat.transport', [])

  .factory('transport', function() {

    var messageListeners = [];

    var sock = new SockJS(window.location.origin + '/chat');

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