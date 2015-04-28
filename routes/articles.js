var Article=require('./model/article');
var cryptoJs=require('../public/javascripts/cryptoJs');
var express = require('express');
var fs=require('fs');
var path=require('path');
var parse=require('url').parse;
var formidable=require('formidable');
var os=require('os');
var ifaces=os.networkInterfaces();
var ip;
Object.keys(ifaces).forEach(function(ifname){
    if(ifname=="本地连接"){
        ip=ifaces[ifname][1].address;
    }
});
var router = express.Router();
//首页
router.get('/', function(req, res) {
  res.sendFile('client/index.html');
});
//文章垃圾箱
router.get('/article_trash',function(req,res){
    var query=parse(req.url,true).query;
    if(query.p){
        Article.find({'delete':1}).sort('-create_time').select('title').exec(function(err,results){
            if(err){
                console.log(err);
                res.send({status:500,message:'Internal Error'});
            }else if(results.length>0){
                res.send({status:200,message:results});
            }else{
                res.send({status:404,message:'暂无数据'});
            }
        });
    }else{
        res.send({status:404,message:'缺少参数'});
    }
});
//文章点赞数排行
router.get('/article_hot',function(req,res){
    Article.find().sort('-favor').where('favor').gt(0).limit(9).select('_id title favor').exec(function(err,result){
        if(err){
            console.log(err);
            res.send({status:500,message:'Internal Error'});
        }else if(result.length>0){
            res.send({status:200,message:result});
        }else{
            res.send({status:404,message:'暂无数据'});
        }
    });
});
//喜欢文章------限制点赞频率未做
router.get('/article_favor',function(req,res){
    var query=parse(req.url,true).query;
//    console.log(query)
    if(query.id){
        Article.findOne({_id:query.id},function(err,article){
            if(article){
                article.favor++;
                article.save(function(err,a){
                    if(err){
                        console.log(err);
                    }else{
                        res.json({status:200,message:'Favor Success'});
                    }
                });
            }else{
                res.json({status:400,message:'Article Not Found'});
            }
        });
    }else{
        res.json({status:400,message:'id Required'});
    }
});
//新建文章
router.put('/article_op',function(req,res){
//	console.log(req.body);
	var article=new Article();
	article.title=req.body.title;
	article.content=req.body.content;
	article.create_time=req.body.create_time;
	article.category=req.body.category;
	article.save(function(err,result){
		err && console.log(err);
//		console.log(result)
		if(result){
			res.send({status:200,message:'Save Success'});
		}else{
			res.send({status:500,message:'Internal Error'});
		}
	});
});
//更新文章    文章撤销删除
router.post('/article_op/:id',function(req,res){
//	console.log(req.body);
	if(!req.body.id){
		res.json({status:400,message:'Parameters Error'});
	}else if(req.body.delete==0){
        Article.findOneAndUpdate({_id:req.body.id},{delete:req.body.delete},function(err,result){
            if(err){
                console.log(err);
                res.send({status:500,message:'Internal Error'});
            }else if(result){
                res.json({status:200,message:'Update Success'});
            }else{
                res.json({status:400,message:'Fail to Update'});
            }
        });
    }else if(req.body.title && req.body.content && req.body.category){
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
	}else{
        res.json({status:400,message:'Parameters Can Not Be Null'});
    }
});
//删除文章    标记删除和彻底删除
router.delete('/article_op/:id/:position',function(req,res){
    var reg=new RegExp('\/[0-9,a-z]+\/','ig');
    var str1=reg.exec(req.url);
//    console.log(str1)
    var reg2=new RegExp('[0-9,a-z]+','ig');
    var id=reg2.exec(str1[0])[0];
//    console.log(id)
//    console.log(typeof id)
    var removeFlag;
    var reg3=new RegExp('\/-1','g');
    if(reg3.test(req.url)){//完全删除
        console.log('remove from database')
        Article.remove({_id:id},function(err,result){
            if(err){
                console.log(err);
                res.send({status:500,message:'Internal Error'});
            }else if(result){
                res.json({status:200,message:'Remove Success'});
            }else{
                res.json({status:400,message:'Fail to Remove'});
            }
        });
    }else{
        Article.findOneAndUpdate({_id:id},{delete:1},function(err,result){//删除文章只是将标识位置为1
            if(err){
                console.log(err);
                res.send({status:500,message:'Internal Error'});
            }else if(result){
                res.json({status:200,message:'Remove Success'});
            }else{
                res.json({status:400,message:'Fail to Remove'});
            }
        });

    }
});

//搜索
function search(keyword,p,res){
    //搜索关键字存在则添加搜索域，否则默认为无
    if(keyword.length<=20 && keyword){
        var p=p || 1;//页码默认为1，每页6条
        keyword=decodeURIComponent(keyword);
//        console.log(keyword)
        var symbols=['$','@','!','#','%','^','&','*','(',')','-'];
        for(var i=0;i<symbols.length;i++){
            var index=keyword.indexOf(symbols[i]);
//            console.log(index);
            if(index!=-1){
                var arr=keyword.split('');
                arr.splice(index,0,'\\');
                keyword=arr.join('');
                break;
            }
        }
//        console.log(keyword)
        var reg=new RegExp(keyword,'ig');
        var q;

        q={delete:0,title:reg};
        Article.find(q).skip((p-1)*10).limit(10).exec(function(err,results){
            err && console.log(err);
            //关键字存在则对搜索的结果中的关键字标亮
            var repStart=new RegExp('<###########','g');
            var repEnd=new RegExp('###########>','g');
            if(keyword){
                for(var i=0;i<results.length;i++){
                    var t=results[i].title.match(reg);
                    for(var j=0;t && j<t.length;j++){
                        results[i].title=results[i].title.replace(t[j],'<###########'+t[j]+'###########>');
                    }
                    results[i].title=results[i].title.replace(repStart,'<mark>');
                    results[i].title=results[i].title.replace(repEnd,'</mark>');
                }
            }
            Article.count(q,function(err,result){
                err && console.log(err);
                res.setHeader('count',result);
                res.json(results);
            });
        });
    }
}
//分页获取所有文章
router.get('/article_list',function(req,res,next){
	var query=parse(req.url,true).query;
    console.log(query)
	var p=query.p || 1;
	var condition={'delete':0};
	if(query.category && query.category!='all'){
		condition={'category':query.category,'delete':0};
	}else{
		condition={'delete':0};
	}
	// console.log(condition);
    if(!query.keyword){
        Article.find(condition,'title create_time category favor').sort('-create_time').where('delete').equals(0).skip((p-1)*10).limit(10).exec(function(err,results){
            err && console.log(err);
            Article.count(condition,function(err,result){
                err && console.log(err);
                res.setHeader('count',result);
                res.json(results);
            });
        });
    }else{
        search(query.keyword,query.p,res);
    }

});
//根据id获取具体文章
router.get('/article_op/:id/:flip/:position',function(req,res){
//	console.log(req.params.id);
//	console.log(req.params.flip);
	if(req.params.id && req.params.id.length==24){
		Article.findOne({'_id':req.params.id},function(err,result){
			if(err){
                console.log(err);
            }else if(result){//根据_id找到文章
                var first_id,last_id,end=0;
                Article.find({'delete':0}).sort('create_time').select('_id').exec(function(err,allA){
                    if(err){
                        console.log(err);
                        res.send({status:500,message:'Internal Error'});
                    }else{
                        first_id=allA[0]._id;
                        last_id=allA[allA.length-1]._id;
                    }
                    if(req.params.flip==1){
                        //查下一篇，即发布时间离现在远的，并返回_id
                        Article.find({'delete':0}).where('create_time').sort('-create_time').lt(result.create_time).limit(1).select('_id').exec(function(err,preA){
                            if(err){
                                console.log(err);
                                res.send({status:500,message:'Internal Error'});
                            }else if(preA.length>0){
                                if(preA._id==first_id.toString()){
                                    end=-1;
                                }else if(preA._id==last_id.toString()){
                                    end=1;
                                }else{
                                    end=0;
                                }
                                res.json({status:200,message:preA,position:parseInt(req.params.position)+1,end:end});
                            }else{
                                res.json({status:404,message:'Article Not Found'});
                            }
                        });
                    }else if(req.params.flip==-1){
                        //查上一篇，即发布时间离现在近的，并返回_id
                        Article.find({'delete':0}).where('create_time').sort('create_time').gt(result.create_time).limit(1).select('_id').exec(function(err,nextA){
                            if(err){
                                console.log(err);
                                res.send({status:500,message:'Internal Error'});
                            }else if(nextA.length>0){
                                if(nextA[0]._id==first_id.toString()){
                                    end=-1;
                                }else if(nextA[0]._id==last_id.toString()){
                                    end=1;
                                }else{
                                    end=0;
                                }
                                res.json({status:200,message:nextA,position:parseInt(req.params.position)-1,end:end});
                            }else{
                                res.json({status:404,message:'Article Not Found'});
                            }
                        });
                    }else{//查选定id的文章
                        if(result._id==first_id.toString()){
                            end=-1;
                        }else if(result._id==last_id.toString()){
                            end=1;
                        }else{
                            end=0;
                        }
                        res.json({status:200,message:result,end:end});
                    }
                });

            }else{//根据_id未找到文章
                res.json({status:404,message:'Article Not Found'});
            }
		});
	}else{
		res.json({status:400,message:'Require id'});
	}
});

//simditor上传图片
function isFormData(req){
    var type=req.headers['content-type'] || '';
    return 0==type.indexOf('multipart/form-data');
}
var imageArray=['image/bmp','image/png','image/gif','image/jpeg'];
router.post('/article/img_upload',function(req,res){
    var serverIP=req.headers.origin;
    if(!isFormData(req)){
        res.json({status:400,success:false,message:'Bad Request',file_path:''});
        return ;
    }
    var form=new formidable.IncomingForm();
    form.encoding='utf-8';//设置form的域的编码
    form.hash='md5';//生成文件hash
    form.parse(req,function(err,fields,files){
        //写到存储器上
//        console.log(fields)//获取文件名
//        console.log(files)//上传的内容
        for(var i=0;i<imageArray.length;i++){
            if(files.upload_file.type==imageArray[i]){
                var append=imageArray[i].split('/');
                var date=new Date();
                var originPath=files.upload_file.path;
                var newPath='/images/'+files.upload_file.hash+date.getTime()+'.'+append[1];
                var readStream=fs.createReadStream(originPath);
                var writeStream=fs.createWriteStream('./public'+newPath);
                readStream.pipe(writeStream);
                readStream.on('close',function(){
                    fs.unlink(originPath);
                });
                res.json({success:true,msg:'上传成功',file_path:serverIP+newPath});
                break;
            }
        }
        if(i>=imageArray.length){
            res.json({status:400,success:false,message:'Bad Request',file_path:''});
        }
    });
});

module.exports=router;