angular.module('app.chat.service', ['app.chat.transport'])

  .factory('messageService', ['$http', '$timeout', 'transport', function($http, $timeout, transport) {

    transport.onConnect(function() {
      console.log('transport OK');
    });

    transport.onDisconnect(function() {
      console.log('transport KO');
    });

    function handleResponse(promise, cb) {
      promise
        .success(function(data) {
          if (typeof cb === 'function') {
            cb(true, data);
          }
        })
        .error(function() {
          if (typeof cb === 'function') {
            cb(false);
          }
        });
    }

    function retrieveLatestMessages(cb) {
      handleResponse($http.get('/msg'), function(success, messages) {
        if (!success || messages.length === 0) {
          return;
        }

        messages.forEach(function(msg) {
          cb(msg);
        });
      });
    }

    function postMessage(msg) {
      transport.send(msg);
    }

    function onMessage(cb) {
      transport.onMessage(function(event) {
        if (event.type === 'message' && event.data) {
          cb(JSON.parse(event.data));
        }
      });
    }

    return {
      postMessage: postMessage,
      retrieveLatestMessages: retrieveLatestMessages,
      onMessage: onMessage
    };
  }]);
