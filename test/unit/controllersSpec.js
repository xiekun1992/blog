'use strict';

describe("controller unit tests",function(){
	beforeEach(module('app'));
	beforeEach(module('app.controller'));
	beforeEach(module('app.service'));
	
	var $cookieStore,categoryRest,$httpBackend;
	
	beforeEach(inject(function($injector,_$httpBackend_,$controller){
		$httpBackend=_$httpBackend_;
		$cookieStore=$injector.get('$cookieStore');
		categoryRest=$injector.get('categoryRest');
	}));

	describe('loginCtrl should work as expected',function(){
		var $scope,$rootScope;
		beforeEach(inject(function($controller,$rootScope){
			$rootScope=$rootScope;
			$scope=$rootScope.$new();
			$controller('loginCtrl',{$scope:$scope});
		}));
		it("user operation should be initialized correctly",function(){
			expect($scope.autoLogin).toBeTruthy();
			expect($scope.username).toBeFalsy();
			expect($scope.password).toBeFalsy();
			expect($scope.logout).toBeFalsy();
			expect($scope.login).toBeFalsy();
		});
		it("error information should be initialized correctly",function(){
			expect($scope.error).toBeFalsy();
			expect($scope.errorInfo).toEqual("");
		});
		it("user should show password",function(){
			$scope.pwd="password";
			$scope.eye();
			expect($scope.pwd).toBe("text");
			expect($scope.eyeIcon).toBe("glyphicon-eye-close");
			expect($scope.mention).toBe("隐藏密码");
			$scope.eye();
			expect($scope.pwd).toBe("password");
			expect($scope.eyeIcon).toBe("glyphicon-eye-open");
			expect($scope.mention).toBe("显示密码");
		})
	});
	describe('passwordCtrl should work as expected',function(){
		var $scope,$rootScope,$state;
		beforeEach(inject(function($injector,$controller,$rootScope){
			$rootScope=$rootScope;
			$state=$injector.get('$state');
			$rootScope.$state=$state;
			$scope=$rootScope.$new();
			$controller('passwordCtrl',{$scope:$scope});
		}));
		it('p1 and p2 should be initialized correctly',function(){
			expect($scope.p1).toBe(undefined);
			expect($scope.p2).toBe(undefined);
		});
	});
	describe('articlesCtrl should work as expected',function(){
		var $scope,$rootScope;
		beforeEach(inject(function($injector,$controller){
			$rootScope=$injector.get('$rootScope');
			$rootScope.$state=$injector.get('$state');
			$scope=$rootScope.$new();
			$controller('articlesCtrl',{$scope:$scope});
		}));
		it('key should be initialized correctly',function(){
			expect($scope.key).toBe(undefined);
			$scope.key='js';
			expect($scope.key).toEqual('js');
		});
	});
	describe('articleListCtrl should work as expected',function(){
		var $scope,$rootScope;
		beforeEach(inject(function($injector,$controller){
			$rootScope=$injector.get('$rootScope');
			$scope=$rootScope.$new();
			$rootScope.$state=$injector.get('$state');
			$rootScope.$stateParams=$injector.get('$stateParams');
			$controller('articleListCtrl',{$scope:$scope});
		}));
		it('all field should be initialized correctly',function(){
			expect($scope.articles).toEqual([]);
			expect($scope.articles.length).toEqual(0);
			expect($scope.request).toEqual('/article_list?category=all&keyword=undefined');
			expect($scope.currentPage).toEqual(1);
			expect($scope.noResult).toBe(undefined);
			expect($scope.execSearch).toBeTruthy();
		});
	});
	describe('editCtrl should work as expected',function(){
		var $scope,$rootScope,articleRest,categoryRest;
		beforeEach(inject(function($injector,$controller){
			$rootScope=$injector.get('$rootScope');
			$rootScope.$stateParams=$injector.get('$stateParams');
			$scope=$rootScope.$new();
			categoryRest=$injector.get('categoryRest');
			articleRest=$injector.get('articleRest');
			$controller('editCtrl',{$scope:$scope});
		}));
		it('all field should be initialized correctly',function(){
			expect($scope.welcome).toEqual('写点东西吧');
	        expect($scope.data).toEqual({});
			expect($scope.category).toEqual(['Angular', 'Node', 'MongoDB']);
		});
	});
	describe('trashCanCtrl should work as expected',function(){
		var $scope,$rootScope,articleRest,$httpBackend;
		beforeEach(inject(function($injector,$controller){
			$rootScope=$injector.get('$rootScope');
			$scope=$rootScope.$new();
			articleRest=$injector.get('articleRest');
			$httpBackend=$injector.get('$httpBackend');
			$controller('trashCanCtrl',{$scope:$scope});
		}));
		it('array should be initialized correctly',function(){
			expect($scope.articleUseless).toEqual([]);
			expect($scope.articleUseless.length).toEqual(0);
		});
	});
});