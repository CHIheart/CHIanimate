/**
 * 视频列表
 * @authors Your Name (you@example.org)
 * @date    2016-05-13 13:40:18
 * @version $Id$
 */



define('videos',function(require,exports,module){
	$(".Videos [data-src]").click(function(event) {
		var src=$(this).data("src");
		loadPlugin("player",function(){
			var embed=$("<embed/>");
			embed.attr({
				src:src,
				autoplay:true
			});
			$(".PLAYER dd").empty().append(embed).closest('.FullScreenPlugin').fadeIn();
		},function(){
			$(".PLAYER dt q").click(function(event) {
				$(this).closest('.FullScreenPlugin').fadeOut().find("dd").empty();
			});
		});
	});
	return ;
});

seajs.use('videos');