var webdriver = require('selenium-webdriver');

var By = webdriver.By;
var Key = webdriver.Key;

function AppDriver(driver, webdriver) {
  this.driver = driver;
}

AppDriver.prototype = {

  element: function element(cssSelector) {
    return this.driver.findElement(By.css(cssSelector));
  },

  getViewText: function getViewText() {
    return this.element('#instructions').getText();
  },

  openApp: function open() {
    this.driver.get('http://localhost:9999');
  },

  sendMessage: function sendMessage(message) {
    var el = this.element('#message-input');
    el.clear();
    el.sendKeys(message, Key.ENTER);
  },

  getHistoryContent: function getHistoryContent() {
    return this.element('#message-history').getText();
  },

  sleep: function sleep(delayInMs) {
    this.driver.sleep(delayInMs);
  }
};

module.exports = AppDriver;