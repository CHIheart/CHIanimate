//首页启动
define(function(require,exports,module){
	require("scrollbar");
	require("attrs/margin_padding");
	require("attrs/border_outline");
	$("p").scrollbar({
		goal:{
			//"margin":"10px 20px 30px 40px",
			"padding":"1em 20% 30px 4rem",
			"border":"red 10px inset"
		}
	})
});