var messages = require('./db').messages;
var redis = require('redis');

var idSequence = 1;
var redisClient = redis.createClient();

redisClient.on('message')

function getLastMessagesSince(req, res) {
  var afterId = parseInt(req.param('afterId', '0'), 10);

  var filteredMessages = messages.filter(function(message) {
    return message.id > afterId;
  });
  res.json(filteredMessages);
}

function createMessage(msgContent, type, sender) {
  var id = idSequence++;
  var message = {id: id, msg: msgContent, type: type, sender: sender, time: new Date().getTime()};
  // messages.push(message);
  // TODO
  redisClient.emit(message);
  return message;
}

function postMessage(req, res) {
  createMessage(req.body.msg, 'userMessage');
  res.json({success: true});
}

function listenToSocket(socket) {
  var connections = {};

  function writeToOtherConnections(conn, msg) {
    var msgAsString = JSON.stringify(msg);
    Object.keys(connections).forEach(function(id) {
      if (id !== conn.id) {
        connections[id].conn.write(msgAsString);
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
    writeToOtherConnections(conn, createMessage(userLabel + ' entered the chat', 'userState'));

    conn.on('data', function(msgContent) {
      writeToOtherConnections(conn, createMessage(msgContent, 'userMessage', userColor));
    });

    conn.on('close', function() {
      writeToOtherConnections(conn, createMessage(userLabel + ' left the chat', 'userState'));
    });
  });
}

function install(app, server) {
  app.get('/msg', getLastMessagesSince);
  app.post('/msg', postMessage);

  var chatSocket = require('sockjs').createServer();
  listenToSocket(chatSocket);
  chatSocket.installHandlers(server, {prefix: '/chat'});
}

module.exports = {
  getLastMessagesSince: getLastMessagesSince,
  install: install,
  listenToSocket: listenToSocket,
  postMessage: postMessage
};
