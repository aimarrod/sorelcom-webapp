var gm = require('gm');

module.exports.returnAll = function(err, data, res){
  if(err && err !== 'No results')
    return res.send(500, err);
  
  res.json(200, data);
};

module.exports.returnOne = function(err, data, res){
  if(err)
    if(err === 'No results')
      return res.send(204);
    else
      return res.send(500, err);
  res.json(200, data);
};

module.exports.returnOK = function(err, data, res){
  if(err) return res.send(500, err);
  res.send(200, "OK");
};

module.exports.saveImage = function(file, prepend, done){
  var name = file.path.split('/').pop();
  var newPath = __dirname + "/../../app/images/" + prepend + name;
  gm(file.path).resize(256, 256).autoOrient()
    .write(newPath, function (err) {
      done(err, name);
    });
};
