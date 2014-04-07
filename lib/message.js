var messages = [];

function getLastMessagesSince(req, res) {
  var timestamp = parseInt(req.param('time', '0'), 10);
  console.log(timestamp, messages);
  res.json(messages);
}

function postMessage(req, res) {
  messages.push({msg: req.body.msg, time: new Date().getTime()});
  res.json({success: true});
}

module.exports = {
  getLastMessagesSince: getLastMessagesSince,
  postMessage: postMessage
};