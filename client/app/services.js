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
}]);