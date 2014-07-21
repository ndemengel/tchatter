angular.module('app.chat.service', ['app.chat.transport'])

  .factory('messageService', ['$http', '$timeout', 'transport', function($http, $timeout, transport) {

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

    function getMessagesSince(afterId, cb) {
      handleResponse($http.get('/msg?afterId=' + afterId), cb);
    }

    function retrieveLastMessages(cb) {
      getMessagesSince(0, function(success, messages) {
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
      retrieveLastMessages: retrieveLastMessages,
      onMessage: onMessage
    };
  }]);
