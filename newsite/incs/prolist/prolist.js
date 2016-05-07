/**
 * 产品列表，把默认图片换成产品图片
 * @authors Your Name (you@example.org)
 * @date    2016-05-07 15:38:51
 * @version $Id$
 */



define('PROLIST',function(require,exports,module){
	$("[data-src]").css({
		opacity:0
	}).each(function(index, el) {
		$(this).attr("src",$(this).data("src"));
	}).load(function() {
		$(this).animate({
			opacity:1
		})
	});
	return ;
});
seajs.use('PROLIST')