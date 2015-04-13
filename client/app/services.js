angular.module('app.service',['ngResource'])
.service('articleRest',['$resource',function($resource){
	return $resource(
		'/article_op/:id',
		{id:'@id'},
		{post:{method:'POST',isArray:false},save:{method:'PUT',isArray:false}}
		);
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
					defer.reject('no user online');
				}
			}).error(function(){
				defer.reject();
			});
			return defer.promise;
		}
	}
}]);