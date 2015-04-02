var express = require('express');
var User=require('./model/user');
var parse=require('url').parse;
var router = express.Router();

var crypto=require('crypto');

/* GET users listing. */
router.get('/current_user',function(req,res, next){
	if(req.session.user){
		res.json({status:200,message:req.session.user});
	}else{
		res.json({status:401,message:'no user login'});
	}
});
router.get('/logout',function(req,res, next){
	//session
	var query=parse(req.url,true).query;
	console.log(query)
	console.log('logout: '+req.session.user._id);
	if(req.session.user._id==query.id){
		req.session.user=null;
		res.json({status:200,message:'logout success'});
	}else{
		res.json({status:403,message:'forbidden'});
	}
});
router.post('/login', function(req, res, next) {
	console.log(req.session);
	var md5=crypto.createHash('md5');
	md5.update(req.body.params.password);
	User.findOne({
		username:req.body.params.username,
		password:md5.digest()
	},function(err,result){
		err && console.log(err);
		console.log(result)
		if(result){
			result.password='';
			//session
			if(!req.session.user){
				req.session.user=result;
  				res.json({status:200,message:result});
			}else if(req.session.user._id==result._id){
  				res.json({status:200,message:'user already online'});
			}
		}else{
			res.json({status:401,message:'username or password error!'});
		}
	});
});

module.exports = router;
