var messages = require('./db').messages;
var idSequence = 1;

function getLastMessagesSince(req, res) {
  var afterId = parseInt(req.param('afterId', '0'), 10);

  var filteredMessages = messages.filter(function(message) {
    return message.id > afterId;
  });
  res.json(filteredMessages);
}

function postMessage(req, res) {
  var id = idSequence++;
  messages.push({id: id, msg: req.body.msg, time: new Date().getTime()});
  res.json({success: true});
}

module.exports = {
  getLastMessagesSince: getLastMessagesSince,
  postMessage: postMessage
};
