/**
 * 通用脚部
 * @authors Your Name (you@example.org)
 * @date    2016-05-14 15:55:11
 * @version $Id$
 */



define('footer',function(require,exports,module){
	//当滚过2屏以上时显示回顶
	$(window).on('load resize scroll', function(event) {
		$(".GOTOP").stop(true).animate({
			opacity: 
			$(this).scrollTop() > $(this).height() *2 ?
			1: 0
		});
	});
	//点击回顶
	$(".GOTOP").click(function(event) {
		$("body,html").animate({
			scrollTop : 0
		})
	});
	return ;
});

seajs.use('footer');