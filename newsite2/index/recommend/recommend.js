/**
 * 乐车仔推荐
 * @authors Your Name (you@example.org)
 * @date    2016-05-13 10:06:12
 * @version $Id$
 */



define('recommend',function(require,exports,module){
	var CHImovie=require("effects/movie");
	CHImovie(".Recommend .QUINTFRAME",".container",{
		prev:".Recommend dt sub",
		next:".Recommend dt sup"
	});
	return ;
});
seajs.use('recommend');