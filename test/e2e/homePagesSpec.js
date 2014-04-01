var ptor = protractor.getInstance();
var by = protractor.By;
var element = ptor.findElement.bind(ptor);

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var expect = chai.expect;

describe('Home Pages', function () {

  it('should load the homepage', function () {
    ptor.get('/#');

    expect(element(by.id('view-container')).getText()).to.eventually.equal('Welcome Home...');
  });

});
