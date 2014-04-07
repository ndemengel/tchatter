function AppDriver() {
}

AppDriver.prototype = {

  getViewText: function getViewText() {
    return element(by.id('instructions')).getText();
  },

  openApp: function open() {
    browser.get('/#');
  },

  sendMessage: function sendMessage(message) {
    element(by.id('message-input')).sendKeys(message, protractor.Key.ENTER);
  },

  getHistoryContent: function getHistoryContent() {
    return element(by.id('message-history')).getText();
  },

  wait: function wait(delayInMs) {
    browser.sleep(delayInMs);
  }
};

module.exports = new AppDriver();