/**
 * 幻灯片效果
 * @authors Your Name (you@example.org)
 * @date    2016-03-12 16:13:57
 * @version $Id$
 */

//这三种写法都有效
define('PPT',function(require,exports,module){
	var CHIppt=require("effects/ppt.js");
	CHIppt(".PPT","ul li",{
		indices:".PPT ol li",
		prev:".PPT sub",
		next:".PPT sup"
	});
	return ;
});

seajs.use('PPT');