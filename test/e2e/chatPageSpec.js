var ptor = protractor.getInstance();
var by = protractor.By;
var element = ptor.findElement.bind(ptor);

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Chat Page', function() {

  it('should welcome the user', function() {
    ptor.get('/#');
    expect(element(by.id('view-container')).getText()).to.eventually.equal('Welcome to Tchatter...');
  });

});
