/**
 * 头部图片的特效
 * @authors Your Name (you@example.org)
 * @date    2016-05-28 10:07:00
 * @version $Id$
 */

define('photo',function(require,exports,module){
	//百度分享
	require.async("plugins/bdshare");
	window._bd_share_config = {
		common : {
			bdText : document.title,	
			bdDesc : $(".Summary").text(),	
			bdUrl : location.href, 	
			bdPic : '自定义分享图片',
			onBeforeClick : function(cmd,config){
				//百度分享的内容不会自动更新，所以要临时手动改
				config.bdPic=$(".LargePhoto img").attr("src");
				return config;
			}
		},
		share : [{
			"bdSize" : 16
		}],
		slide : false,
		image : false,
		selectShare : false
	}
	require.async("effects/movie",function(CHImovie){
		var movie=CHImovie(".Movie","ul",{
			prev:".Thumbs sub",
			next:".Thumbs sup"
		},{
			auto:false,
			minLi:5
		},{
			move:function(aim){
				aim.trigger('click',[true]);
			}
		});
		$(".Movie").data('movie',movie);
	})
	$(".Movie li").on('click', function(event,bFromMovie) {
		if(!bFromMovie){
			var movie=$(this).closest('.Movie').data('movie');
			if(movie) movie.show($(this).index());
		}
		var img=$(this).find("img");
		$(".LargePhoto img").attr({
			src: img.data("large"),
			"data-primary": img.data("primary"),
			alt: img.attr("alt")
		}).data("primary", img.data("primary"));
	});
	//放大镜效果
	require.async("effects/magnifier",function(CHImag){
		CHImag(".LargePhoto img",{
			width:544,
			height:544,
			x:1,
			y:-1
		});
	});
	return ;
});
seajs.use('photo');