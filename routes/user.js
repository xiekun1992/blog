var express = require('express');
var User=require('./model/user');
var router = express.Router();

var crypto=require('crypto');

/* GET users listing. */
router.post('/login', function(req, res, next) {
	console.log(req.body);
	var md5=crypto.createHash('md5');
	md5.update(req.body.params.password);
	User.find({
		username:req.body.params.username,
		password:md5.digest()
	},function(err,result){
		err && console.log(err);
		console.log(result)
		if(result.length>0){
			result[0].password='';
  			res.json({status:200,message:result[0]});
		}else{
			res.json({status:401,message:'username or password error!'});
		}
	});
});

module.exports = router;
