//首页启动
define(function(require,exports,module){
	require("./easing");
	require("./scrollbar");
	require("./attrs/margin_padding");
	require("./attrs/border_outline");
	require("./attrs/trbl");
	require("./attrs/zIndex");
	require("./attrs/color");
	require("./attrs/text");
	require("./attrs/width_height");
	require("./attrs/shadow");
	require("./attrs/background-position");
	require("./attrs/radius");
	$("p").scrollbar({
		goal:{
			// "margin":"10px 20px 30px 40px",
			// "padding":"1em 20% 30px 4rem",
			// border:"10px solid green",
			// "left":100,
			// right:200,
			// top:"15%",
			// bottom:400,
			// zIndex:20,
			// color:'transparent',
			// width:300,
			// height:'150%',
			// fontSize:"200%",
			// lineHeight:"300%",
			// textIndent:"-20%",
			// wordSpacing:"1em",
			// letterSpacing:"10px",
			// textShadow:"5px 2px hsla(123,25.5%,36.7%,.8)",
			// backgroundPosition:"-50px right",
			// boxShadow:"3px 5px 6px 2px white inset",
			borderRadius:"50%"
		}
	});
	// $("div").scrollbar({
	// 	goal:{
	// 		backgroundPosition:"-50px right",

	// 	}
	// })
});