angular.module('app.filter',[])
.filter('htmlConverter',['$sce',function($sce){
	return function(input){
		return $sce.trustAsHtml(input);
	}
}]);