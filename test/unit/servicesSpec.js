'use strict';

describe('service unit tests',function(){
	beforeEach(module('app.service'));

	var $rootScope,$httpBackend,$q,$resource,articleRest,getCurrentUser,PublishOrUpdate;
	
	beforeEach(inject(function($injector,_$httpBackend_){
		$httpBackend=_$httpBackend_;
		$rootScope=$injector.get('$rootScope');
		$resource=$injector.get('$resource');
		articleRest=$injector.get('articleRest');
		getCurrentUser=$injector.get('getCurrentUser');
		PublishOrUpdate=$injector.get('PublishOrUpdate');
	}));
	describe('articleRest should work as expected',function(){
		it('articleRest GET should work well',function(){
			$httpBackend.expect('GET','/article_op/5541c64366ef4de81ba4dc73/0/4').respond(200,{"status":200,"message":{"_id":"5541c64366ef4de81ba4dc73","category":"MongoDB","create_time":"2015-04-30T06:05:55.225Z","content":"<p><a href=\"http://mobile.51cto.com/aengine-448430.htm\" target=\"_blank\" class=\"\">http://mobile.51cto.com/aengine-448430.htm</a><br></p>","title":"mongodb的导入导出方法","__v":0,"page_number":0,"delete":0,"favor":0},"end":0});
			
			articleRest.get({id:'5541c64366ef4de81ba4dc73',flip:0,position:4},function(data){
				expect(data.message.category).toEqual('MongoDB');
			});
			$httpBackend.flush();
		})
		it('articleRest DELETE should work well',function(){
			$httpBackend.expect('DELETE','/article_op/5541c64366ef4de81ba4dc73/0/4').respond(200,{"status":200,"message":"删除成功"});
			
			articleRest.remove({id:'5541c64366ef4de81ba4dc73',flip:0,position:4},function(data){
				expect(data.message).toEqual('删除成功');
			});
			$httpBackend.flush();
		})
		it('articleRest PUT should work well',function(){
			$httpBackend.expect('PUT','/article_op').respond(200,{status:200,message:'保存成功'});
			
			articleRest.save({title:'this is a test',content:'<div>a simple test</div>',category:'AngularJS',create_time:new Date()},function(data){
				expect(data.message).toEqual('保存成功');
			});
			$httpBackend.flush();
		})
		it('articleRest POST should work well',function(){
			$httpBackend.expect('POST','/article_op/5541c64366ef4de81ba4dc73').respond(200,{status:200,message:'更新成功'});
			
			articleRest.post({title:'this is another test',content:'<div>another simple test</div>',category:'AngularJS',id:'5541c64366ef4de81ba4dc73'},function(data){
				expect(data.message).toEqual('更新成功');
			});
			$httpBackend.flush();
		})
	});
	describe('getCurrentUser should work as expected',function(){
		it('no user',function(){
			$httpBackend.expect('GET','/user/current_user').respond(200,{"status":10104,"message":"无用户登录"});
			getCurrentUser.query().then(function(){
				expect($rootScope.user).toBe(null);	
			});
		});
		it('user online',function(){
			$httpBackend.expect('GET','/user/current_user').respond(200,{"status":200,"message":{_id:'5541c64366ef4de81ba4dc73',username:'xiekun'}});
			getCurrentUser.query().then(function(){
				expect($rootScope.user.username).toBe('xiekun');
				expect($rootScope.user._id).toBe('5541c64366ef4de81ba4dc73');
			});
		});
	});
});