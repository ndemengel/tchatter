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

    messageService.onMessage(function(messages) {
      $scope.userMessages = $scope.userMessages.concat(messages);
    });
  }]);
