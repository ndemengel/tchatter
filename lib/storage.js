var redis = require('redis');

var CHANNEL = "channel";
var LATEST_MESSAGES_KEY = "latest";
var MIN_RANGE = -20;
var MAX_RANGE = -1;

var REDIS_HOST = process.env.REDIS_HOST || 'localhost';
var REDIS_PORT = process.env.REDIS_PORT || 6379;

var queryClient = redis.createClient(REDIS_PORT, REDIS_HOST);
var subscriber = redis.createClient(REDIS_PORT, REDIS_HOST);
subscriber.subscribe(CHANNEL);

function publish(message) {
  var jsonMsg = JSON.stringify(message);
  queryClient.publish(CHANNEL, jsonMsg);
  queryClient.rpush(LATEST_MESSAGES_KEY, jsonMsg);
  queryClient.ltrim(LATEST_MESSAGES_KEY, MIN_RANGE, MAX_RANGE);
}

function onMessage(cb) {
  subscriber.on('message', function (channel, jsonMsg) {
    cb(JSON.parse(jsonMsg));
  });
}

function fetchLatestMessages(cb) {
  queryClient.lrange(LATEST_MESSAGES_KEY, MIN_RANGE, MAX_RANGE, function (err, replies) {
    var messages = replies.map(function (reply) {
      return JSON.parse(reply);
    });

    cb(messages);
  });
}

module.exports = {
  publish: publish,
  onMessage: onMessage,
  fetchLatestMessages: fetchLatestMessages
};