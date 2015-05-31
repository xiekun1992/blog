'use strict';

describe('directive unit tests',function(){
	beforeEach(module('app.directive'));
	beforeEach(module('app.service'));
	var $compile,$rootScope,getSpecificArticle,PublishOrUpdate;
	beforeEach(inject(function($injector,_$rootScope_,_$compile_){
		$compile=_$compile_;
		$rootScope=_$rootScope_;
		$rootScope.$state=$injector.get('$state');
		PublishOrUpdate=$injector.get('PublishOrUpdate');
		getSpecificArticle=$injector.get('getSpecificArticle');
	}));
	it('siderbar template should be ok',function(){
		var element=$compile('<right-side-tool-bar></right-side-tool-bar>')($rootScope);
        $rootScope.$digest();
        expect(element.html()).toEqual(
        	'<ul class="right-side-bar" id="rightSideBar">' +'<li id="previousArticle" class="toolbar-no-hover label label-primary"></li>' +'<li id="nextArticle" class="toolbar-no-hover label label-primary"></li>' +'<li id="publish" class="toolbar-no-hover label label-primary"></li>'+'<li id="update" class="toolbar-no-hover label label-primary"></li>'+'<li id="goToTop" class="toolbar-top-no-hover label label-primary"></li>' +'</ul>');
	});
	it('textEditor template should be ok',function(){

	});
	it('page template should be ok',function(){
		
	});
});