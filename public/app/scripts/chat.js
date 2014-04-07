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
    var lastTimestamp = 0;

    function retrieveLastMessages() {
      if (!lastRequestReturned) {
        return;
      }

      lastRequestReturned = false;

      messageService.getMessagesSince(lastTimestamp, function(success, data) {
        lastRequestReturned = true;
        if (success) {
          if (data.length !== 0) {
            lastTimestamp = data[data.length - 1].time;
          }
          $scope.userMessages = $scope.userMessages.concat(data);
        }
      });
    }

    $interval(retrieveLastMessages, 1000);
    retrieveLastMessages();
  }]);
