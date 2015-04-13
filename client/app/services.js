angular.module('app.service',['ngResource'])
.service('articleRest',['$resource',function($resource){
	return $resource(
		'/article_op/:id',
		{id:'@id'},
		{post:{method:'POST',isArray:false},save:{method:'PUT',isArray:false}}
		);
}])
.service('routeState',[function(){
        this.state={page:1,searchKey:''};
        return this.state;
    }])
.service('getCurrentUser',['$q','$http','$rootScope',function($q,$http,$rootScope){
	return {
		query:function(){
			var defer=$q.defer();
			$http.get('/user/current_user')
			.success(function(data,status,headers,config){
				if(200==data.status){
					$rootScope.user=data.message;
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