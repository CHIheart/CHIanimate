/**
 * 首页独立JS
 */

define('index',function(require,exports,module){
	$(".Main dt li").mouseenter(function(event) {
		$(this).siblings('s').stop(true).animate({
			left: $(this).position().left,
			width: $(this).width()
		})
	}).filter(":first-child").mouseenter();
	return ;
});

seajs.use('index');