var Article=require('./model/article');
var express = require('express');
var parse=require('url').parse;
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile('client/index.html');
});
//新建文章
router.put('/article_op',function(req,res){
	console.log(req.body);
	var article=new Article();
	article.title=req.body.title;
	article.content=req.body.content;
	article.create_time=req.body.create_time;
	article.category=req.body.category;
	article.save(function(err,result){
		err && console.log(err);
		console.log(result)
		if(result){
			res.send({status:200,message:'Save Success'});
		}else{
			res.send({status:500,message:'Internal Error'});
		}
	});
});
//更新文章
router.post('/article_op/:id',function(req,res){
	console.log(req.body);
	if(!req.body.id){
		res.json({status:400,message:'Parameters Error'});
	}else{
		Article.findOne({_id:req.body.id},function(err,result){
			err && console.log(err);
			result.title=req.body.title;
			result.content=req.body.content;
			result.category=req.body.category;
			result.save(function(err,result){
				err && console.log(err);
				res.json({status:200,message:'Update Success'});
			});
		})
		
	}
});
//删除文章
router.delete('/article_op/:id',function(req,res){
	var id=req.url.substr(12);
	Article.findOneAndRemove({_id:id},function(err,result){
		if(result){
			res.json({status:200,message:'Remove Success'});
		}else{
			res.json({status:400,message:'Fail to Remove'});
		}
	});
});
//分页获取所有文章
router.get('/article_list',function(req,res,next){
	console.log(parse(req.url,true).query);
	var query=parse(req.url,true).query;
	var p=query.p || 1;
	var condition={};
	if(query.category && query.category!='all'){
		condition={'category':query.category};
	}else{
		condition={};
	}
	console.log(condition);
	Article.find(condition,'title create_time category').sort('filed -create_time').skip((p-1)*10).limit(10).exec(function(err,results){
		err && console.log(err);
		Article.count(condition,function(err,result){
			err && console.log(err);
			res.setHeader('count',result);
			res.json(results);
		});
	});
});
//根据id获取具体文章
router.get('/article_op/:id',function(req,res){
	console.log(req.params.id);
	if(req.params.id){
		Article.findOne({'_id':req.params.id},function(err,result){
			err && console.log(err);
			res.json({status:200,message:result});			
		});
	}else{
		res.json({status:400,message:'Require id'});
	}
});
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
				var start=results[i].content.indexOf(query.keyword);
				start=(start==-1?start+1:start);
				results[i].content=results[i].content.substr(start);
				results[i].content=results[i].content.replace(reg,'<mark>'+query.keyword+'</mark>');
				// results[i].category=results[i].category.replace(reg,'<mark>'+query.keyword+'</mark>');
			}
		}
		res.json(results);
	});
});

module.exports=router;