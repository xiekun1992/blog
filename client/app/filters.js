angular.module('app.filter',[])
.filter('htmlConverter',['$sce',function($sce){
	return function(input){
		return $sce.trustAsHtml(input);
	}
}])
.filter('dateFormat',[function(){
	return function(input){
		return moment(input).locale('zh-cn').format('YYYY-MM-DD HH:mm');
	}
}]);