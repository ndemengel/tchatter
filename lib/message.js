var messages = require('./db').messages;
var idSequence = 1;

function getLastMessagesSince(req, res) {
  var afterId = parseInt(req.param('afterId', '0'), 10);

  var filteredMessages = messages.filter(function(message) {
    return message.id > afterId;
  });
  res.json(filteredMessages);
}

function createMessage(msgContent, type) {
  var id = idSequence++;
  var message = {id: id, msg: msgContent, type: type, time: new Date().getTime()};
  messages.push(message);
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
        connections[id].write(msgAsString);
      }
    });
  }

  socket.on('connection', function(conn) {
    connections[conn.id] = conn;

    conn.write(JSON.stringify(createMessage('Welcome ' + conn.id, 'userState')));
    writeToOtherConnections(conn, createMessage(conn.id + ' entered the chat', 'userState'));

    conn.on('data', function(msgContent) {
      writeToOtherConnections(conn, createMessage(msgContent, 'userMessage'));
    });

    conn.on('close', function() {
      writeToOtherConnections(conn, createMessage(conn.id + ' left the chat', 'userState'));
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
