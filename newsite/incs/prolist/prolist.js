/**
 * 产品列表，把默认图片换成产品图片
 * @authors Your Name (you@example.org)
 * @date    2016-05-07 15:38:51
 * @version $Id$
 */

define('PROLIST',function(require,exports,module){
	var imgs=$("img[data-src]");
	$(window).on("scroll load resize",function(event) {
		var scroll=$(this).scrollTop();
		imgs=$.grep(imgs, function(item, index) {
			var offset=$(item).offset().top,
				height=$(item).outerHeight(),
				wh=$(window).height();
			//图片在可视范围内，出现后将其从数组中删除
			if(offset<=scroll + wh && offset + height>=scroll){
				$(item).css('opacity', 0)
					.attr("src", $(item).data("src"))
					.load(function(){$(item).animate({opacity:1})});
				if(item.complete) $(item).animate({opacity:1});
				return false;
			}return true;
		});
	});
	return ;
});
seajs.use('PROLIST')