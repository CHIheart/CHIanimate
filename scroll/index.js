//首页启动
define(function(require,exports,module){
	require("scrollbar");
	require("attrs/margin_padding");
	require("attrs/border_outline");
	require("attrs/trbl");
	$("p").scrollbar({
		goal:{
			//"margin":"10px 20px 30px 40px",
			"padding":"1em 20% 30px 4rem",
			"left":100,
			right:200,
			top:"15%",
			bottom:400
		}
	});
	setTimeout(function(){
		console.log($("div").exactPosition());
	});
});