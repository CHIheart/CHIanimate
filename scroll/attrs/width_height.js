//width和height
define(function(require,exports,module){
	var wh=['width','height'],
		BAR=$.scrollbar,
		U_position=require("tools/U_position")
	;
	for(var x in wh)
	{
		attr=wh[x];
		BAR.extend(attr,{
			units:'px|em|rem|%',
			negative:false,
			unify:U_position
		});
	}
	wh=null;
});