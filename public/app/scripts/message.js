angular.module('app.message', [])

  .factory('messageService', ['$http', '$timeout', function($http, $timeout) {

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

    var lastId = 0;

    var callbacks = [];

    function retrieveLastMessages() {
      getMessagesSince(lastId, function(success, data) {
        $timeout(retrieveLastMessages, 1000);

        if (!success || data.length === 0) {
          return;
        }

        // Ensure filtering of messages to handle parallel requests
        var filteredData = data.filter(function(message) {
          return message.id > lastId;
        });

        lastId = filteredData[filteredData.length - 1].id;

        callbacks.forEach(function(cb) {
          cb(filteredData);
        });
      });
    }

    return {
      postMessage: function postMessage(msg, cb) {
        handleResponse($http.post('/msg', {msg: msg}), cb);
      },

      getMessagesSince: getMessagesSince,

      onMessage: function onMessage(cb) {
        callbacks.push(cb);

        if (callbacks.length === 1) {
          retrieveLastMessages();
        }
      }
    };
  }]);
