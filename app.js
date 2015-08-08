var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose=require('mongoose');
var session=require('express-session');
var routes = require('./routes/index');
var users = require('./routes/user');
var articles=require('./routes/articles');
var search=require('./routes/search');
var categories=require('./routes/categories');

var Article=require('./routes/model/article');
var User=require('./routes/model/user');
var crypto=require('crypto');
var md5=crypto.createHash('MD5');
md5.update('8b8ea141884e1de88a2d9255055a3666');//xiekun
var pwd=md5.digest('hex');
User.findOne({username:'xiekun'},function(err,result){
    if(err){
        console.log('初始用户设置失败')
        console.log(err);
    }else if(!result){
        var user=new User({
            username:'xiekun',
            password:pwd,
            create_time:new Date(),
            last_login_time:new Date()
        });
        user.save(function(err,result){
            err && console.log(err);
            console.log(result)
        });
    }
});
// var fs=require('fs');

// var data=fs.readFileSync('./routes/data.json','utf-8');
// data=JSON.parse(data);
// for(var d=0;d<data.length;d++){
//     var article=new Article({
//         title:data[d].title,
//         content:data[d].content,
//         create_time:new Date(),
//         category:'MongoDB'
//     });
//     article.save(function(err,res){
//         err && console.log(err);
//         console.log(res);
//     });
// }

var app = express();

mongoose.connect('mongodb://localhost/blog');
var db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.on('open',function(){
    console.log('Accessing mongodb');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/client/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret:'xiekun',
    cookie:{maxAge:60*60*1000*10},
    resave:true,
    saveUninitialized:true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// app.use('/',function(req,res){
//     if(req.method=="GET"){
//       res.sendFile('client/index.html');
//     }
// });
app.use('/app',function(req,res){
    console.log(__dirname)
    res.sendFile(__dirname+'/client/index.html');
});
app.use('/', articles);
app.use('/user', users);
app.use('/category',categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
