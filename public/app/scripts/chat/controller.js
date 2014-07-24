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

    $scope.bodyStyle = {'background-color': window.Tchatter.COLOR};
    $scope.userColor = window.Tchatter.COLOR;

    $scope.submitMessage = function submitMessage() {
      var msgContent = $scope.newMessage;

      messageService.postMessage(msgContent);

      $scope.userMessages.push({ msg: msgContent, user: window.Tchatter.COLOR, type: "userMessage" });

      // clear input
      $scope.newMessage = null;

      scrollHistoryToBottomOnNewMessage();
    };

    function addToHistory(message) {
      console.log(message);
      $scope.$apply(function() {
        $scope.userMessages.push(message);
        scrollHistoryToBottomOnNewMessage();
      });

    }

    function scrollHistoryToBottomOnNewMessage() {
      $scope.$watch('userMessages', function() {
        var messageHistoryDiv = document.getElementById("message-history");
        if (messageHistoryDiv) {
          messageHistoryDiv.scrollTop = messageHistoryDiv.scrollHeight;
        }
      });
    }

    messageService.retrieveLatestMessages(addToHistory);

    messageService.onMessage(addToHistory);
  }]);
