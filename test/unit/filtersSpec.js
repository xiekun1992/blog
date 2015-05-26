'use strict';

describe('filter unit tests',function(){
	beforeEach(module('app.filter'));
	var $sce,$filter;
	beforeEach(inject(function($injector,_$filter_){
		$sce=$injector.get('$sce');
		$filter=_$filter_;
	}));
	// it('dateFormat should work as expected',inject(function(dateFormatFilter){
	// 	expect(dateFormatFilter('Tue May 25 2015 14:01:33 GMT+0800 (中国标准时间)')).toBe('2015-05-25 14:01');
	// }));
	it('dateFormat',function(){
		var dateFormat=$filter('dateFormat');
		expect(dateFormat('Tue May 25 2015 14:01:33 GMT+0800 (中国标准时间)')).toBe('2015-05-25 14:01');
	})
	// it('htmlConverter should work as expected',inject(function(htmlConverterFilter){
	// 	expect((htmlConverterFilter('<br>Explicitly trusted HTML bypasses')).$$unwrapTrustedValue()).toEqual('<br>Explicitly trusted HTML bypasses');
	// }))
	it('htmlConverter',function(){
		var htmlConverter=$filter('htmlConverter');
		expect(htmlConverter('<div>aaa</div>').$$unwrapTrustedValue()).toEqual('<div>aaa</div>');
		expect(htmlConverter('')).toEqual('');
		expect(htmlConverter(null)).toEqual(null);
	})
});