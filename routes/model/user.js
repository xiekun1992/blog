var mongoose=require('mongoose');
var userSchema=mongoose.Schema({
	'username':String,
	'password':String,
	'create_time':Date,
	'last_login_time':Date
});

var user=mongoose.model('User',userSchema);

module.exports=user;