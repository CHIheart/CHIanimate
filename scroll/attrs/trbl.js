//top/right/bottom/left，可以计算初始值auto
//在parse阶段，当数据对象中有了left/top时，会将right/bottom删除或忽略（CSS优先规则）
define(function(require,exports,module){
	var BAR=$.scrollbar,
		parseTRBL=require("tools/P_trbl"),
		TRBL='top,right,bottom,left'.split(','),
		//火狐下没有整合属性，需要cssHook的get（set居然是可以的……）
		NEED=/firefox|msie/i.test(BROWSER),
		U_position=require("tools/U_position")
	;
	require("tools/exactPosition");
	for(var n in TRBL)
	{
		var name=TRBL[n];
		BAR.extend(name,{
			units:'px|em|rem|%',
			unify:U_position,
			parse:function(database,selector){
				var attr=this.name,
					oppo=TRBL[($.inArray(attr,TRBL) + 2) % 4],
					isLow=/right|bottom/i.test(attr),
					val=database[attr],
					isAuto=/auto/i.test(val);
				//因为CSS是以左上为优先，所以不能同时存在左右/上下，要删除优先级低的右下属性
				if(oppo in database)
				{
					delete(database[isLow ? attr : oppo]);
					if(isLow || !isAuto) return true;
				}
				//如果发现有auto值，就直接计算四个方向值，这样下次再用就不会出现auto了
				isAuto && (database[attr]=$(selector).css($(selector).exactPosition()).css(attr));
			}
		});
	}
});