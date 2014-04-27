var express = require('express'),
  path = require('path'),
  message = require('./lib/message');

var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public', 'app/')));
});

/* Routes */
app.get('/msg', message.getLastMessagesSince);
app.post('/msg', message.postMessage);

var server;

function start() {
  server = app.listen.apply(app, arguments);
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