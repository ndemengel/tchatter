angular.module('myApp', ['ngRoute', 'app.chat'])

  .constant('TPL_PATH', '/templates')

  .config(function($routeProvider, TPL_PATH) {
    $routeProvider.when('/', {
      controller: 'ChatCtrl',
      templateUrl: TPL_PATH + '/chat.html'
    });
  });
