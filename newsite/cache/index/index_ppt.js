//Written by PROCESS.PHP at the time of 2016-05-06 22:43:37
/**
 * 首页独立JS
 */

define('index',function(require,exports,module){
	return ;
});

seajs.use('index');
/**
 * 幻灯片效果
 * @authors Your Name (you@example.org)
 * @date    2016-03-12 16:13:57
 * @version $Id$
 */

//这三种写法都有效
define('PPT',function(require,exports,module){
	var CHIppt=require("effects/ppt.js?qeuris");
	CHIppt(".PPT","ul li",{
		indices:".PPT ol li",
		prev:".PPT sub",
		next:".PPT sup"
	});
	return ;
});
// define('PPT',["effects/ppt.js"],function(require,exports,module){
// 	var CHIppt=seajs.require("effects/ppt.js");
// 	console.log(CHIppt);
// 	return ;
// });
// define('PPT',function(require,exports,module){
// 	seajs.use("effects/ppt.js",function(CHIppt){
// 		console.log(CHIppt);
// 	})
// 	return ;
// });

seajs.use('PPT');