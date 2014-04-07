var express = require('express'),
  path = require('path'),
  message = require('./lib/message');

var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public/app/')));
  // TODO if (env == 'dev')
  // app.use(express.errorHandler());
});

/* Routes */
app.get('/msg', message.getLastMessagesSince);
app.post('/msg', message.postMessage);

app.listen(9999);

console.log('App started at http://localhost:9999/');
