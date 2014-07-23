var express = require('express'),
  path = require('path'),
  messageService = require('./lib/message'),
  monitoring = require('./lib/monitoring'),
  session = require('./lib/session');

var app = express(),
  server;

app.configure(function() {
  app.use(express.bodyParser());
  app.use(monitoring);
  session.setup(app);
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public', 'app/')));
});

function start() {
  server = app.listen.apply(app, arguments);
  messageService.install(app, server);
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