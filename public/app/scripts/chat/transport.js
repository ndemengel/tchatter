angular.module('app.chat.transport', [])

  .factory('transport', function() {
    if (!window.Tchatter || !window.Tchatter.COLOR) {
      throw new Error('window.Tchatter.COLOR must be defined!');
    }

    var CLOSED = 'CLOSED';
    var INIT = 'INIT';
    var READY = 'READY';
    var DEFAULT_RETRY_TIMEOUT = 1000;
    var MAX_RETRY_TIMEOUT = 64000;

    var connectListeners = [];
    var disconnectListeners = [];
    var messageListeners = [];
    var pendingMessages = [];
    var retryTimeout = DEFAULT_RETRY_TIMEOUT;
    var sock;
    var state = CLOSED;

    function getAndIncreaseRetryTimeout() {
      var timeout = retryTimeout;
      if (retryTimeout <= MAX_RETRY_TIMEOUT) {
        retryTimeout *= 2;
      }
      return timeout;
    }

    function sendOrBuffer(msg) {
      if (state === READY) {
        try {
          sock.send(msg);
        } catch (e) {
          console.log('Could not send message, queuing it...', e);
          pendingMessages.push(msg);
        }
      }
      else {
        pendingMessages.push(msg);
      }
    }

    function transportClosed() {
      state = CLOSED;
      disconnectListeners.forEach(function(listener) {
        listener();
      });
    }

    function transportReady() {
      state = READY;
      connectListeners.forEach(function(listener) {
        listener();
      });
    }

    function sendPendingMessagesWhilePossible() {
      if (state !== INIT) {
        return;
      }

      if (pendingMessages.length === 0) {
        transportReady();
        return;
      }

      var msg = pendingMessages[0];
      if (msg) {
        try {
          sock.send(msg);
          pendingMessages.shift();
        } catch (e) {
          console.log('Could not send pending message, retrying later...', e);
        }
      }

      // allows for sock.onclose to be called between two messages if connection is lost
      window.setTimeout(sendPendingMessagesWhilePossible, 1);
    }

    function openSocket() {
      if (sock) {
        sock.close();
        sock = null;
        return;
      }

      sock = new SockJS(window.location.origin + '/chat', undefined, {
        server: window.Tchatter.COLOR
      });

      sock.onopen = function() {
        retryTimeout = DEFAULT_RETRY_TIMEOUT;
        state = INIT;
        sendPendingMessagesWhilePossible();
      };

      sock.onmessage = function(e) {
        messageListeners.forEach(function(fn) {
          fn(e);
        });
      };

      sock.onclose = function() {
        if (state === CLOSED) {
          return;
        }
        transportClosed();
        window.setTimeout(tryOpeningSocket, DEFAULT_RETRY_TIMEOUT);
      };
    }

    function tryOpeningSocket() {
      openSocket();
      window.setTimeout(retryOpeningSocketIfNecessary, getAndIncreaseRetryTimeout());
    }

    function retryOpeningSocketIfNecessary() {
      if (sock && sock.readyState === SockJS.CONNECTING) {
        window.setTimeout(retryOpeningSocketIfNecessary, DEFAULT_RETRY_TIMEOUT);
        return;
      }

      if (!sock || sock.readyState !== SockJS.OPEN) {
        state = CLOSED;
        tryOpeningSocket();
      }
    }

    tryOpeningSocket();

    return {
      onConnect: function(cb) {
        connectListeners.push(cb);
      },
      onDisconnect: function(cb) {
        disconnectListeners.push(cb);
      },
      onMessage: function(fn) {
        messageListeners.push(fn);
      },
      send: sendOrBuffer
    };
  });