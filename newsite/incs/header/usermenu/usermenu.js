/**
 * 顶用户菜单
 */

define(function(require,exports,module){
	//鼠标指向用户菜单时，菜单下滑
	$(".USERMENU").mouseenter(function(event) {
		$(this).addClass('on').find('dd ul').slideDown();
	}).mouseleave(function(event) {
		$(this).find('dd ul').slideUp(function(){
			$(".USERMENU").removeClass('on');
		});
	});
	return ;
});