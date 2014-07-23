var storage = require('./storage');

var idSequence = 1;

function getLatestMessages(req, res) {
  storage.fetchLatestMessages(function(messages) {
    res.json(messages);
  });
}

function createMessage(msgContent, type, sender) {
  var id = idSequence++;
  return {id: id, msg: msgContent, type: type, sender: sender, time: new Date().getTime()};
}

function publishMessage(msgContent, msgType, senderColor) {
  storage.publish(createMessage(msgContent, msgType, senderColor));
}

function postMessage(req, res) {
  publishMessage(req.body.msg, 'userMessage', req.userColor);
  res.json({success: true});
}

function listenToSocket(socket) {
  var connections = {};

  storage.onMessage(writeToOtherUsers);

  function writeToOtherUsers(msg) {
    var sender = msg.sender;
    var msgAsString = JSON.stringify(msg);
    Object.keys(connections).forEach(function(id) {
      var conn = connections[id];
      if (conn.userColor !== sender) {
        conn.conn.write(msgAsString);
      }
    });
  }

  socket.on('connection', function(conn) {
    var userColor = conn.url.split('/')[2],
      userLabel = 'Mr ' + userColor;

    connections[conn.id] = {
      conn: conn,
      userColor: userColor
    };

    conn.write(JSON.stringify(createMessage('Welcome ' + userLabel, 'userState')));
    publishMessage(userLabel + ' entered the chat', 'userState', userColor);

    conn.on('data', function(msgContent) {
      publishMessage(msgContent, 'userMessage', userColor);
    });

    conn.on('close', function() {
      publishMessage(userLabel + ' left the chat', 'userState', userColor);
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
