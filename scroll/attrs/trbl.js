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
			// ing:function(init,goal,selector){
			// 	var attr=this.name,
			// 		oppo=TRBL[($.inArray(attr,TRBL) + 2) % 4],
			// 		isLow=/right|bottom/i.test(attr),
			// 		val=init[attr]
			// },
			units:'px|em|rem|%',
			unify:U_position,
			//这里的四方向值不可能是auto，因为在ing步骤中已经执行过绝对定位
			parse:function(database,selector,srcDB){
				var attr=this.name,
					oppo=TRBL[($.inArray(attr,TRBL) + 2) % 4],
					isLow=/right|bottom/i.test(attr),
					val=database[attr],
					isAuto=/auto/i.test(val),
					DOM=$(selector);
				//如果值为auto则计算一次元素的绝对定位，并获取新值
				isAuto && (DOM.css(DOM.exactPosition()),database[attr]=DOM.css(attr))
				//如果是值为auto的低级属性，则将其从初始值中删除，并记录相反方向的值
				&& isLow && (srcDB[oppo]=DOM.css(oppo),delete(srcDB[attr]));
				//因为CSS是以左上为优先，所以不能同时存在左右/上下，要删除优先级低的右下属性
				oppo in database ? delete(database[isLow ? attr : oppo]) : database[oppo]='auto';
			}
		});
	}
});