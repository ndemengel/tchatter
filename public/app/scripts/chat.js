angular.module('app.chat', ['app.message'])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('ChatCtrl',
  ['$scope', '$interval', 'messageService', 'welcomeMessage', function($scope, $interval, messageService,
                                                                       welcomeMessage) {
    $scope.userMessages = [];
    $scope.welcome_message = welcomeMessage();

    $scope.submitMessage = function submitMessage() {
      messageService.postMessage($scope.userMessage, function(success) {
        console.log('Success? ' + success);
      });
    };

    var lastRequestReturned = true;
    var lastId = 0;

    function retrieveLastMessages() {
      if (!lastRequestReturned) {
        return;
      }

      lastRequestReturned = false;

      messageService.getMessagesSince(lastId, function(success, data) {
        lastRequestReturned = true;
        if (!success || data.length === 0) {
          return;
        }

        // Ensure filtering of messages to handle parallel requests
        var filteredData = data.filter(function(message) {
          return message.id > lastId;
        });

        $scope.userMessages = $scope.userMessages.concat(filteredData);

        lastId = filteredData[filteredData.length - 1].id;
      });
    }

    // TODO only perform new request when last one has been received
    $interval(retrieveLastMessages, 1000);
    retrieveLastMessages();
  }]);
