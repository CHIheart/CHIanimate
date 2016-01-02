//margin和padding
//IE及WEBKIT下的padding解析，当元素是绝对定位的话，它的padding是基于定位元素的内容区的，而不是填充区，但本扩展按统一的计算，即基于填充区
define(function(require,exports,module){
	var mp=['padding','margin'],
		BAR=$.scrollbar,
		parseTRBL=require("tools/P_trbl"),
		TRBL='Top,Right,Bottom,Left'.split(','),
		U_position=require("tools/U_position"),
		//火狐下没有整合属性，需要cssHook的get（set居然是可以的……）
		NEED=/firefox|msie/i.test(BROWSER),
		H_trbl=require("tools/H_trbl")
	;
	for(var x in mp)
	{
		var attr=mp[x],
			parts=[];
		for(var n in TRBL)
		{
			var name=attr+TRBL[n];
			parts.push(name);
			BAR.extend(name,{
				units:'px|em|rem|%',
				unify:U_position
			});
		}
		BAR.extend(attr,{
			hook:NEED ? H_trbl : $.noop,
			negative:attr=='margin',//外边距可以为负，内填充不能为负
			parts:parts,
			parse:parseTRBL
		});
		parts=null;
	}
	mp=null;
});