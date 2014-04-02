var db = require('./../connectors/parliament'),
    geo = require('./../utils/geo'),
    util = require('util');

/** Mock */
var counter = 1;

function Post (data){
	this.id = data.id;
    this.description = data.description;
    this.author = data.author;
    this.target = data.target;
    this.date = data.date;

    /** Insert route to triplestore */
	this.save = function(done){

		var oldTriples = util.format('sorelcom:%s sorelcom:hasPost ?list1] . ',	this.author) +
            util.format('sorelcom:%s sorelcom:hasPost ?list2] . ',				this.target);
        
        var newTriples = util.format('sorelcom:%s rdf:type sorelcom:Post . ',						this.id) +
            util.format('sorelcom:%s sorelcom:hasDescription "%s" . ',								this.id, this.description) +
            util.format('sorelcom:%s sorelcom:hasAuthor sorelcom:%s . ',							this.id, this.author) +
            util.format('sorelcom:%s sorelcom:hasPost [rdf:first sorelcom:%s;rdf:rest ?list1] . ',	this.author, this.id) +
            util.format('sorelcom:%s sorelcom:hasPost [rdf:first sorelcom:%s;rdf:rest ?list2] . ',	this.target, this.id);
        
        var where = util.format('sorelcom:%s sorelcom:hasPost ?list1] . ',	this.author) +
            util.format('sorelcom:%s sorelcom:hasPost ?list2] . ',			this.target);

        db.insert(oldTriples, newTriples, where, done);
	};
}

Post.create = function (author, post){
    return new Post({
        id: 'post'+counter++,
        description: post.text,
        author: author,
        target: post.target,
        date: new Date()
    });    
};

Post.findById = function (id, done){
    db.select(util.format('sorelcom:%s sorelcom:hasDescription ?text . ', id), done);
};

Post.list = function (done){
    var select = '?id rdf:type sorelcom:Post . ?id sorelcom:hasLabel ?name .';
    db.select(null, select, null, function (err, data) {
        if (err)
            done(err);
        else {
            done(null, data);
        }
    });
};

module.exports = Post;