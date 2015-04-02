angular.module('app.service',['ngResource'])
.service('articleRest',['$resource',function($resource){
	return $resource(
		'/article_detail/:id',
		{id:'@id'});
}])
.service('articleEditRest',['$resource',function($resource){
	return $resource(
		'/article_edit/:id',
		{id:'@id'},
		{put:{method:'PUT',isArray:false}});
}])
.service('userInfo',[function(){
	var info={'login':''};
	return info;
}])
.service('getCurrentUser',['$q','$http','$rootScope',function($q,$http,$rootScope){
	return {
		query:function(){
			var defer=$q.defer();
			$http.get('/user/current_user')
			.success(function(data,status,headers,config){
				if(200==data.status){
					$rootScope.user=data.message;
					$rootScope.user.last_login_time=new Date($rootScope.user.last_login_time).toLocaleDateString();
					defer.resolve(data);
				}else{
					$rootScope.user=null;
					defer.reject();
				}
			}).error(function(){
				defer.reject();
			});
		}
	}
}]);