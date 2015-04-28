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
    if(query.keyword.length<=10){
        q={$or:[{title:reg},{content:reg}]};
    }else{
        q={};
    }
    var p=query.p || 1;//页码默认为1，每页6条
    Article.find(q).skip((p-1)*10).limit(10).exec(function(err,results){
        err && console.log(err);

        //关键字存在则对搜索的结果中的关键字标亮
        var repStart=new RegExp('<###########','g');
        var repEnd=new RegExp('###########>','g');
        if(query.keyword){
            for(var i=0;i<results.length;i++){
                var t=results[i].title.match(reg);
                for(var j=0;t && j<t.length;j++){
                    results[i].title=results[i].title.replace(t[j],'<###########'+t[j]+'###########>');
                    results[i].content=results[i].content.replace(t[j],'<###########'+t[j]+'###########>');
                }
                results[i].title=results[i].title.replace(repStart,'<mark>');
                results[i].title=results[i].title.replace(repEnd,'</mark>');
                results[i].content=results[i].content.replace(repStart,'<mark>');
                results[i].content=results[i].content.replace(repEnd,'</mark>');
            }
        }
        Article.count(q,function(err,result){
            err && console.log(err);
            res.setHeader('count',result);
            res.json(results);
        });
    });
});

module.exports=router;