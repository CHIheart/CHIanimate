//测试浏览器的，直接生成window级的变量
define(function(require,exports,module){
	var s=navigator.userAgent
	//浏览器名称
	window.BROWSER=/msie|webkit|firefox|opera|ucweb/i.exec(s)[0].toLowerCase();
	//当是IE的时候，返回IE版本号
	if(window.BROWSER=='msie')
	{
		window.ie=window.IE=/msie (\d)\./i.exec(s)[1] * 1 || '?';
		//低于IE9就是低端浏览器
		window.ie<9 && (window.low=true);
	}
	//设备名称
	var d=/iphone|android|ipad|blackberry|nokia|tablet|windows phone/i.exec(s);
	window.DEVICE= d ? d.toLowerCase() : 'pc';
	//操作系统名称
	window.SYSTEM=/windows|linux|macintosh|blackberry|symbian/i.exec(s)[0].toLowerCase();
	//使用可以将对象完整显示的console方法
	window.CONSOLE=function(o){
		console[(function(){
			if(typeof o=='object')
			{
				switch(window.BROWSER)
				{
					case 'msie': return 'dir';
					case 'firefox': return 'table';
					default: return 'info';
				}
			}
			return 'info';
		})()](o);
	}
});