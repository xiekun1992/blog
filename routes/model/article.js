var mongoose=require('mongoose');
var articleSchema=mongoose.Schema({
	'title':String,
	'content':String,
	'create_time':Date,
	'category':String,
    'favor':{type:Number, default:0},
    'delete':{type:Number, default:0}
});

var article=mongoose.model('Article',articleSchema);

module.exports=article;