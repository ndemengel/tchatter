angular.module('app.message', [])

  .factory('messageService', ['$http', function($http) {

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

    return {
      postMessage: function(msg, cb) {
        handleResponse($http.post('/msg', {msg: msg}), cb);
      },
      getMessagesSince: function(afterId, cb) {
        handleResponse($http.get('/msg?afterId=' + afterId), cb);
      }
    };
  }]);
