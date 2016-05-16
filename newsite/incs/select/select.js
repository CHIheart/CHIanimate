/**
 * 下拉菜单初始化
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:27:10
 * @version $Id$
 */

define(function(require,exports,module){
	alert(1);
	$(".SELECT")
		.find('dt').click(function(event) {
			$(this).closest('.SELECT').toggleClass('on');
		})
		.siblings('dd').click(function(event) {
			var tar=$(event.target);
			if(tar.data("id")!==undefined){
				$(this).closest('.SELECT')
					.find("input[type='hidden']").val(tar.data("id")).end()
				.removeClass('on');
			}
		});
	return "abcdefg";
});