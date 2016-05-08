//Written by PROCESS.PHP at the time of 2016-05-08 09:41:25
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
/**
 * 首页四大块
 * @authors Your Name (you@example.org)
 * @date    2016-05-07 10:05:59
 * @version $Id$
 */



define('Funcs',function(require,exports,module){
	require("plugins/raphaelFlipShadow");
	var ps=[
		[0,0,0,30,55,0],[234+2,195,234+2,195-55,234+2-30,195],
		[318+2,0,318+2-50,0,318+2,30],[0,195,40,195,0,195-60],
		[0,0,0,50,75,0],[318+2,195,318+2,195-100,318+2-80,195]
	]
	$(".Funcs > *:not(.Fourth)").each(function(index, el) {
		var oJQcan=$(this).find(".canvas"),
			paper=Raphael(oJQcan.get(0),oJQcan.width()+1,oJQcan.height()+1);
		$(this).data("angles",[
			paper.angle.apply(paper,ps[0 + index*2]),
			paper.angle.apply(paper,ps[1 + index*2])
		])
		.hover(function() {
			var angs=$(this).data("angles");
			angs[0].flipShadow();
			angs[1].flipShadow();
			angs=null;
		}, function() {
			var angs=$(this).data("angles");
			angs[0].flipShadow({reversed:true});
			angs[1].flipShadow({reversed:true});
			angs=null;
		});
	});
	return ;
});
seajs.use('Funcs');
