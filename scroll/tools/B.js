//测试浏览器的，直接生成window级的变量
define(function(require,exports,module){
	var s=navigator.userAgent
	window.BROWSER=/msie|webkit|firefox|opera|ucweb/i.exec(s)[0].toLowerCase();
	window.DEVICE=/iphone|android|ipad|blackberry|nokia|tablet|windows phone/i.exec(s);
	if(!window.DEVICE) window.DEVICE='pc';
	else window.DEVICE=window.DEVICE.toLowerCase();
	window.SYSTEM=/windows|linux|macintosh|blackberry|symbian/i.exec(s)[0].toLowerCase();
});