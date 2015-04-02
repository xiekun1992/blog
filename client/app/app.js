angular.module('app',[
	'ui.router',
	'ngAnimate',
	'ngSanitize',
	'app.controller',
	'app.directive',
	'app.service',
	'app.filter'
])
.run(['$state','$stateParams','$rootScope',function($state,$stateParams,$rootScope){
	$rootScope.$state=$state;
	$rootScope.$stateParams=$stateParams;
}])
.config(['$stateProvider','$urlRouterProvider','$httpProvider',
	function($stateProvider,$urlRouterProvider,$httpProvider){
		// $httpProvider.responseInterceptors.push('htmlInterceptor');

	$urlRouterProvider
	.otherwise('/app/articles/article_list');

	$stateProvider
	.state('app',{
		abstract:true,
		url:'/app',
		template:'<div ui-view></div>',
		controller:'appCtrl'
	})
	.state('app.articles',{
		abstract:true,
		url:'/articles',
		templateUrl:'tpls/articles.html',
		controller:'articlesCtrl',
		resolve:['getCurrentUser',function(getCurrentUser){
			return getCurrentUser.query();
		}]
	})
	.state('app.articles.article_list',{
		url:'/article_list',
		templateUrl:'tpls/article_list.html',
		resolve:['getCurrentUser',function(getCurrentUser){
			return getCurrentUser.query();
		}]
		// controller:'articleListCtrl'
	})
	.state('app.articles.article_detail',{
		url:'/article_detail/{id}',
		templateUrl:'tpls/article_detail.html',
		controller:'articleDetailCtrl',
		resolve:['getCurrentUser',function(getCurrentUser){
			return getCurrentUser.query();
		}]
	})
	.state('app.articles.search',{
		url:'/search/keyword={keyword}&p={p}',
		templateUrl:'tpls/search.html',
		controller:'searchCtrl'
	})
	// 登录后的路由
	.state('app.articles.edit',{
		url:'/edit',
		templateUrl:'tpls/edit.html',
		controller:'editCtrl',
		resolve:['getCurrentUser',function(getCurrentUser){
			return getCurrentUser.query();
		}]
	})
	.state('app.login',{
		url:'/login',
		templateUrl:'tpls/login.html',
		controller:'loginCtrl'
	});
}]);