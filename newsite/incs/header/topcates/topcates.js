/**
 * 顶导航
 * @authors Your Name (you@example.org)
 * @date    2016-04-16 15:12:00
 * @version $Id$
 */
define('topcates',function(require,exports,module){
	$(".MainCates h3").mouseenter(function() {
		$(".SubCates").eq($(this).index()).removeClass('hide')
			.siblings('.SubCates').addClass('hide');
	});
	$(".CATEGORIES").mouseleave(function(event) {
		$(".SubCates:not(.hide)").addClass('hide');
	});
	return ;
});
seajs.use('topcates');