var storage = require('./storage');

var APP_VERSION = 1; // TODO change here application version to 2

function getLatestMessages(req, res) {
  storage.fetchLatestMessages(function(messages) {
    res.json(messages);
  });
}

function createMessage(message) {
  message.time = new Date().getTime();
  return message;
}

function publishMessage(message) {
  storage.publish(createMessage(message));
}

function postMessage(req, res) {
  publishMessage({msg: req.body.msg, type: 'userMessage', user: req.userColor});
  res.json({success: true});
}

function listenToSocket(socket) {
  var connections = {};

  function writeToOtherUsers(msg) {
    var user = msg.user;
    var msgAsString = JSON.stringify(msg);
    Object.keys(connections).forEach(function(id) {
      var conn = connections[id];
      if (conn.userColor !== user) {
        conn.conn.write(msgAsString);
      }
    });
  }

  storage.onMessage(writeToOtherUsers);

  socket.on('connection', function(conn) {
    var userColor = conn.url.split('/')[2];

    connections[conn.id] = {
      conn: conn,
      userColor: userColor
    };

    conn.write(JSON.stringify(createMessage({type: 'userState', user: userColor, event: 'welcome', version: APP_VERSION})));
    publishMessage({type: 'userState', user: userColor, event: 'enter'});

    conn.on('data', function(msgContent) {
      publishMessage({type: 'userMessage', user: userColor, msg: msgContent});
    });

    conn.on('close', function() {
      publishMessage({type: 'userState', user: userColor, event: 'left'});
    });
  });
}

function install(app, server) {
  app.get('/msg', getLatestMessages);
  app.post('/msg', postMessage);

  var chatSocket = require('sockjs').createServer();
  listenToSocket(chatSocket);
  chatSocket.installHandlers(server, {prefix: '/chat'});
}

module.exports = {
  getLatestMessages: getLatestMessages,
  install: install,
  listenToSocket: listenToSocket,
  postMessage: postMessage
};
