var mongoose=require('mongoose');
var articleSchema=mongoose.Schema({
	'title':String,
	'content':String,
	'create_time':Date,
	'category':String,
    'favor':Number
});

var article=mongoose.model('Article',articleSchema);

module.exports=article;