describe('Protractor Blog',function(){
	beforeEach(function(){
		browser.get('http://localhost:3000');
	});
	it('it should start and login',function(){
		var u=element(by.model('key'));
		// var p=element(by.model('password'));
		// element(by.buttonText('搜索')).click();
		u.sendKeys('xiekun');
		// p.sendKeys('asdasd');
		element(by.buttonText('搜索')).click();
	});
	// browser.pause();
});