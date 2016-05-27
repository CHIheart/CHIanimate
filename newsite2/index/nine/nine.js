/**
 * 九大系统
 * @authors Your Name (you@example.org)
 * @date    2016-05-10 15:17:34
 * @version $Id$
 */

define('ninesys',function(require,exports,module){
	var CHImovie=require("effects/movie");
	CHImovie(".NineSystem",".container",{
		prev:".Nine dt sub",
		next:".Nine dt sup"
	});
	return ;
});
seajs.use('ninesys');