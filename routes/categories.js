/**
 * Created by silence on 2015/4/28.
 */
var Category=require('./model/category');
var express=require('express');
var router=express.Router();

//获取所有的分类
router.get('/',function(req,res){
    Category.find().select('-_id name').exec(function(err,results){
        if(err){
            console.log(err);
            res.send({status:500,message:'Internal Error'});
        }else{
            console.log(results)
            var result=[];
            for(var i=0;i<results.length;i++){
                result.push(results[i].name);
            }
            res.send({status:200,message:result});
        }
    });
});
router.put('/:name',function(req,res){
    if(req.body.name) {
        var c=new Category();
        c.name=req.body.name;
        c.save(function (err, result) {
            if (err) {
                console.log(err);
                res.send({status: 500, message: 'Internal Error'});
            } else if(result) {
                res.send({status: 200, message: 'Save Success'});
            } else {
                res.send({status: 400, message: 'Fail to Save'});
            }
        });
    }else{
        res.send({status: 404, message: 'Require Name'});
    }
});

module.exports=router;