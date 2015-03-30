var Article=require('./model/article');
var express = require('express');
var parse=require('url').parse;
var router = express.Router();

console.log('here');
//搜索接口keyword,p
router.get('/search',function(req,res,next){
	console.log(parse(req.url,true).query);
	var query=parse(req.url,true).query;
	var reg=new RegExp(query.keyword,'ig');
	var q;
	//搜索关键字存在则添加搜索域，否则默认为无
	if(query.keyword){
		q={$or:[{title:reg},{content:reg},{category:reg}]};
	}else{
		q={};
	}
	var p=query.p || 1;//页码默认为1，每页6条
	Article.find(q).skip((p-1)*6).limit(6).exec(function(err,results){
		err && console.log(err);
		//关键字存在则对搜索的结果中的关键字标亮
		if(query.keyword){
			for(var i=0;i<results.length;i++){
				results[i].title=results[i].title.replace(reg,'<mark>'+query.keyword+'</mark>');
				results[i].content=results[i].content.replace(reg,'<mark>'+query.keyword+'</mark>');
			}
		}
		res.json(results);
	});
});

module.exports=router;