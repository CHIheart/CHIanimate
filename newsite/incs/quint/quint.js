/**
 * 五个一组的推荐或类似产品
 * @authors Your Name (you@example.org)
 * @date    2016-05-24 16:22:18
 * @version $Id$
 */

define('quint',function(require,exports,module){
	var CHImovie=require("effects/movie");
	$(".QUINTMOVIE").each(function(index, el) {
		CHImovie($(this).find(".container"),"div",{
			prev:$(this).find("sub"),
			next:$(this).find("sup"),
			indices:$(this).find(".indices li")
		})
	});
	return ;
});
seajs.use('quint');