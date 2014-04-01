describe('Home Pages', function() {

  beforeEach(module('app.homePages'));

  it('should test the homePages controller', inject(function($controller, $rootScope) {
    var ctrl = $controller('HomeCtrl', {
      $scope : $rootScope
    });
    expect($rootScope.welcome_message.length).to.be.above(0);
  }));

  it('should properly provide a welcome message', inject(function(welcomeMessage) {
    expect(welcomeMessage()).to.match(/welcome/i);
  }));

});
