angular.module('app.chat', ['app.message'])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('ChatCtrl',
  ['$scope', '$timeout', 'messageService', 'welcomeMessage', function($scope, $timeout, messageService,
                                                                      welcomeMessage) {
    $scope.userMessages = [];
    $scope.welcome_message = welcomeMessage();

    $scope.submitMessage = function submitMessage() {
      messageService.postMessage($scope.userMessage, function(success) {
        console.log('Success? ' + success);
      });
    };

    var lastId = 0;

    function retrieveLastMessages() {
      messageService.getMessagesSince(lastId, function(success, data) {
        $timeout(retrieveLastMessages, 1000);

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

    retrieveLastMessages();
  }]);
