'use strict';

describe("controller unit tests",function(){
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
			// console.log($controller);
			$rootScope=$rootScope;
			$scope=$rootScope.$new();
			$controller('loginCtrl',{$scope:$scope});
		}));
		it("user operation should initialize",function(){
			expect($scope.autoLogin).toBeTruthy();
			expect($scope.username).toBeFalsy();
			expect($scope.password).toBeFalsy();
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
		// it('user should signin', function() {
		// 	$scope.username='xiekun';
		// 	$scope.password='asdasd';
		// 	$httpBackend.expect('POST','/user/login').respond(200,{'username':'xiekun','_id':'55272ed30bee542411fbaf65'});
		// 	$scope.signIn();
		// 	expect($scope.password).toBe(null);
		// });
	});

});