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

router.get('/', function(req, res) {
  res.sendFile('client/index.html');
});
//喜欢文章------限制点赞频率未做
router.get('/article_favor',function(req,res){
    var query=parse(req.url,true).query;
    console.log(query)
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
	Article.findOneAndUpdate({_id:id},{delete:1},function(err,result){//删除文章只是将标识位置为1
		if(result){
			res.json({status:200,message:'Remove Success'});
		}else{
			res.json({status:400,message:'Fail to Remove'});
		}
	});
});
//分页获取所有文章
router.get('/article_list',function(req,res,next){
	// console.log(parse(req.url,true).query);
	var query=parse(req.url,true).query;
	var p=query.p || 1;
	var condition={'delete':0};
	if(query.category && query.category!='all'){
		condition={'category':query.category,'delete':0};
	}else{
		condition={'delete':0};
	}
	// console.log(condition);
	Article.find(condition,'title create_time category favor').sort('-create_time').where('delete').equals(0).skip((p-1)*10).limit(10).exec(function(err,results){
		err && console.log(err);
		Article.count(condition,function(err,result){
			err && console.log(err);
			res.setHeader('count',result);
			res.json(results);
		});
	});
});
//根据id获取具体文章
router.get('/article_op/:id/:flip/:position',function(req,res){
	console.log(req.params.id);
	console.log(req.params.flip);
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
        console.log(fields)//获取文件名
        console.log(files)//上传的内容
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