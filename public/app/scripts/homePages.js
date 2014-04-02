angular.module('app.homePages', [])

  .factory('welcomeMessage', function() {
    return function() {
      return 'Welcome to Tchatter...';
    };
  })

  .controller('HomeCtrl', function($scope, welcomeMessage) {
    $scope.welcome_message = welcomeMessage();
  });
