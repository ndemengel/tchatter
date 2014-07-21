angular.module('app.chat.controller', ['app.chat.service'])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('ChatCtrl',
      ['$scope', '$timeout', 'messageService', 'welcomeMessage',
        function($scope, $timeout, messageService, welcomeMessage) {

    $scope.userMessages = [];
    $scope.welcomeMessage = welcomeMessage();

    $scope.submitMessage = function submitMessage() {
      var msgContent = $scope.newMessage;

      messageService.postMessage(msgContent);

      $scope.userMessages.push({ msg: msgContent });

      // clear input
      $scope.newMessage = null;
    };

    function addToHistory(message) {
      $scope.$apply(function() {
        $scope.userMessages.push(message);
      });
    }

    messageService.retrieveLastMessages(addToHistory);

    messageService.onMessage(addToHistory);
  }]);
