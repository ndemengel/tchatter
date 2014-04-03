angular.module('app.chat', [])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('ChatCtrl', function($scope, welcomeMessage) {
    $scope.welcome_message = welcomeMessage();
  });
