/**
 * 产品列表页
 * @authors Your Name (you@example.org)
 * @date    2016-05-24 14:02:35
 * @version $Id$
 */

define('pros',function(require,exports,module){
	var CHImovie=require("effects/movie");
	//超过5个缩略图的，生成电影滚动特效
	$(".Main .thumbs").each(function(index, el) {
		var lis=$(this).find("li"),
			sub=$(this).find("sub"),
			sup=$(this).find("sup");
		if(lis.length>5){
			CHImovie($(this).find("div"),"ol",{
				prev: sub,
				next: sup
			},{
				minLi:5,
				auto: false
			},{
				move:function(aim){
					aim.click();
				}
			});
		}
		else{
			sub.add(sup).remove();
			lis.eq(0).click();
		}
	})
	//点击缩略图，更换大图信息（所有信息）
	.find("li").click(function(event) {
		$(this).addClass('cur').siblings().removeClass('cur');
		var img=$(this).find("img"),
			signs=img.data('signs'),
			photo=img.data('photo'),
			href=img.data('href'),
			cart=img.data('cart'),
			price=img.data('price'),
			price0=img.data('price0'),
			par=$(this).parentsUntil("ul.PROLIST").last();
		par.find("var img").prop("src",photo).end()
			.find(".prices").html('<ins>'+ price +'元</ins>'+(price0 && ' <del>'+price0+'元</del>')).end()
			.find(".actions .cart a").prop("href",cart).end()
			.find("blockquote").html(function(){
				var aSigns=signs.split(";"),str=[];
				for(var n=0; n<aSigns.length; n++){
					var sign=aSigns[n].split(':');
					str.push('<abbr class="', sign[0] ,'">', sign[1] ,'</abbr> ');
				}
				return str.join('');
			})
	})
	.filter(":first-child").click();
	return ;
});
seajs.use('pros');