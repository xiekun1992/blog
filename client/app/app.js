angular.module('app',[
	'ui.router',
	'ngAnimate',
	'ngSanitize',
    'ngCookies',
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

	$urlRouterProvider
	.otherwise('/app/articles/article_list/1');

	$stateProvider
	.state('app',{
		abstract:true,
		url:'/app',
		templateUrl:'tpls/app.html',
        controller:'loginCtrl'
	})
	.state('app.articles',{
		abstract:true,
		url:'/articles',
		templateUrl:'tpls/articles.html',
		controller:'articlesCtrl'
	})
	.state('app.user',{
		abstract:true,
		url:'/user',
		template:'<div ui-view></div>'
	})
	.state('app.user.password',{
		url:'/password/{token}',
		templateUrl:'tpls/password.html',
		controller:'passwordCtrl'
	})
	.state('app.articles.article_list',{
		url:'/article_list/{page}',
		templateUrl:'tpls/article_list.html',
		resolve:['getCurrentUser',function(getCurrentUser){
			getCurrentUser.query();
			return ;
		}],
		controller:'articleListCtrl'
	})
	.state('app.articles.article_detail',{
		url:'/article_detail/{page}/{position}/{id}',
		templateUrl:'tpls/article_detail.html',
		controller:'articleDetailCtrl',
		resolve:['getCurrentUser',function(getCurrentUser){
			getCurrentUser.query();
			return ;
		}]
	})
	.state('app.articles.search',{
		url:'/search/keyword={keyword}&p={p}',
		templateUrl:'tpls/search.html',
		controller:'searchCtrl'
	})
	// 登录后的路由
	.state('app.articles.edit',{
		url:'/edit/{page}/{position}/{id}',
		templateUrl:'tpls/edit.html',
		controller:'editCtrl',
		resolve:['getCurrentUser','$rootScope',function(getCurrentUser,$rootScope){
			getCurrentUser.query().then(function(data){
				if(data.status !== 200){
					$rootScope.$state.go('app.articles.article_list');
				}
			},function(data){
				$rootScope.$state.go('app.articles.article_list');
			});
			return ;
		}]
	})
}]);