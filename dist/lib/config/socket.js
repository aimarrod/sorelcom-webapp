var session = require('./session');
var passportSocketIo = require("passport.socketio");

module.exports = function(io){
  console.log(passportSocketIo);
  io.use(passportSocketIo.authorize({
    key:    session.key,
    secret: session.secret,
    store:   session.sessionStore,
    fail: function(data, accept) {
      // console.log("failed");
      // console.log(data);//
      accept(null, false);
    },
    success: function(data, accept) {
      //  console.log("success socket.io auth");
      //   console.log(data);
      accept(null, true);
    }
  }));
};
