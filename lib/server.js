var express = require('express'),
  path = require('path');

var app = express();

app.configure(function() {
  app.use('/', express.static(path.join(__dirname, '../public/app/')));
  //app.use(app.router);
  // TODO if (env == 'dev')
  app.use(express.errorHandler());
});

app.listen(9999);