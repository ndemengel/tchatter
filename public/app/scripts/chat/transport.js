angular.module('app.chat.transport', [])

  .factory('transport', function() {

    if (!window.Tchatter || !window.Tchatter.COLOR) {
      throw new Error('window.Tchatter.COLOR must be defined!');
    }

    var messageListeners = [];

    var sock;

    function openSocket() {
      sock = new SockJS(window.location.origin + '/chat', undefined, {
        server: window.Tchatter.COLOR
      });

      sock.onmessage = function(e) {
        messageListeners.forEach(function(fn) {
          fn(e);
        });
      };

      sock.onclose = function() {
        openSocket();
      };
    }

    openSocket();

    return {
      onMessage: function(fn) {
        messageListeners.push(fn);
      },
      send: function(msg) {
        sock.send(msg);
      }
    };
  });