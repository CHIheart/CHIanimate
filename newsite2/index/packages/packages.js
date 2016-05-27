/**
 * 优惠套餐
 * @authors Your Name (you@example.org)
 * @date    2016-05-12 16:58:22
 * @version $Id$
 */

define('packages',function(require,exports,module){
	if(navigator.userAgent.indexOf('MSIE 8')>0)
	$(".Packages label").click(function(event) {
		var box=$(this).prev(":checkbox").get(0);
		box.checked=!box.checked;
		$(box).change();
	});
	return ;
});

seajs.use('packages');