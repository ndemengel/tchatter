module.exports = function(req, res, next) {
  if (req.path === '/health' && req.method === 'HEAD') {
    res.send(200);
    return;
  }

  next();
};