//margin和padding
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
				defaultValue:'0px',
				unify:U_position
			});
		}
		BAR.extend(attr,{
			hook:NEED ? H_trbl : $.noop,
			parts:parts,
			parse:parseTRBL
		});
		parts=null;
	}
	mp=null;
});