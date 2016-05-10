/**
 * 主推产品三大块
 * @authors Your Name (you@example.org)
 * @date    2016-05-09 09:29:17
 * @version $Id$
 */



define('pushes',function(require,exports,module){
	$(".Pushes dt li").mouseenter(function(event) {
		$(this).siblings('s').animate({
			left: $(this).position().left,
			width: $(this).width()
		})
	}).filter(":first-child").mouseenter();
	return ;
});
seajs.use('pushes');