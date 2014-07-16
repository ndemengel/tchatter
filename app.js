var express = require('express'),
  path = require('path'),
  message = require('./lib/message'),
  sockjs = require('sockjs');

var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public', 'app/')));
});

/* Routes */
app.get('/msg', message.getLastMessagesSince);
app.post('/msg', message.postMessage);

var server,
    connections = [];

function start() {
  server = app.listen.apply(app, arguments);


  // TODO voir pour déplacer autant que possible côté service
  var chat = sockjs.createServer();
  chat.on('connection', function(conn) {
    connections.push(conn);
    var number = connections.length;
    conn.write("Welcome, User " + number);
    conn.on('data', function(message) {
      for (var ii = 0; ii < connections.length; ii++) {
        connections[ii].write("User " + number + " says: " + message);
      }
    });
    conn.on('close', function() {
      connections = connections.filter(function(elem) {
        return elem !== conn;
      });

      for (var ii = 0; ii < connections.length; ii++) {
        connections[ii].write("User " + number + " has disconnected");
      }
    });
  });

  chat.installHandlers(server, {prefix: '/chat'});
}

function stop() {
  if (server) {
    server.close();
  }
}

module.exports = {
  start: start,
  stop: stop
};

if (module === require.main) {
  var port = process.argv[2];
  port = port ? parseInt(port, 10) : 8080;

  start(port, function() {
    console.log('App started at http://localhost:' + port + '/');
  });
}