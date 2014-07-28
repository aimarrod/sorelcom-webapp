var socket = require('socket.io');

module.exports = function(app) {
  var io = socket(app);
};
