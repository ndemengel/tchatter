var session = require('cookie-session');

var SESSION_PARAMS = {
  httpOnly: true,
  maxage: 60 * 60 * 1000,
  name: 'userid',
  overwrite: true,
  secret: 'somesupersecuresecret',
  // if SSL outside of node:
  // secureProxy: true,
  signed: true
};

var colorPool = ['red', 'blue', 'pink'];

function colorAssigner(req, res, next) {
  if (req.session.isNew) {
    // Warning: the color attributed to the user will be encoded in the session
    // cookie by cookie-session (-> JSON + base64).
    // This is OK for our simple example, but don't do this with real apps!
    req.session.color = colorPool.pop();

    if (!req.session.color) {
      // sorry guy, no session for you
      req.session = null;
      res.json(401, { error: 'no more free colors'});
      return;
    }
  }

  req.userColor = req.session.color;

  next();
}

module.exports = {
  setup: function(app) {
    app.use(session(SESSION_PARAMS));
    app.use(colorAssigner);

    // SockJS (deliberately) doesn't expose cookies, so we must provide a way
    // (very ugly in our case, for simplicity) for the client to retrieve its
    // identity.
    // see https://github.com/sockjs/sockjs-node#authorisation
    app.get('/mycolor', function(req, res) {
      res.set('Content-Type', 'text/javascript');
      res.send('window.Tchatter.COLOR = "' + req.userColor + '";');
    });
  }
};