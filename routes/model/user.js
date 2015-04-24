var mongoose=require('mongoose');
var userSchema=mongoose.Schema({
	'username':String,
	'password':String,
	'create_time':Date,
	'last_login_time':Date,
	'key':String,//重置密码token
	'key_generate_time':Date,//token生成时间
    'auto_login':String
});

var user=mongoose.model('User',userSchema);

module.exports=user;