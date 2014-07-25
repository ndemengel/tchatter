angular.module('app.chat.controller', ['app.chat.service', 'app.chat.scenario'])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('ChatCtrl',
      ['$scope', '$timeout', 'messageService', 'welcomeMessage', 'scenario',
        function($scope, $timeout, messageService, welcomeMessage, scenario) {

    $scope.userMessages = [];
    $scope.welcomeMessage = welcomeMessage();

    $scope.themeClass = 'theme-' + window.Tchatter.COLOR;
    $scope.userClass = 'user-' + window.Tchatter.COLOR;
    $scope.userColor = window.Tchatter.COLOR;

    $scope.refreshValue = function hackToForceModelUpdate() {
      console.log($scope.newMessage);
    };

    $scope.submitMessage = function submitMessage() {
      var msgContent = $scope.newMessage;

      messageService.postMessage(msgContent);

      $scope.userMessages.push({ msg: msgContent, user: window.Tchatter.COLOR, type: "userMessage" });

      // clear input
      $scope.newMessage = null;

      scrollHistoryToBottomOnNewMessage();
    };

    function addToHistory(message) {
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

    scenario.init($scope);

    messageService.retrieveLatestMessages(addToHistory);

    messageService.onMessage(addToHistory);
  }]);
