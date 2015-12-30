/*
需要判断position属性的转化函数
主要是用在有%单位的数值上的
*/
define(function(require,exports,module){
	var N=require("./N"),
		U=require("./U");
	return function (selector,original,terminal)
	{
		if(U.call(this,selector,original,terminal,true)) return true;
		var attr=this.name,
			position=$(selector).css("position"),
			parent=(function(){
				/*
				返回元素的参照父元素，根据元素的position属性值有所区别
				fixed，window对象
				absolute，$.offsetParent对象
				relative,static，直接父元素
				*/
				switch(position)
				{
					case "fixed": return $(window);
					case "absolute": return $(selector).offsetParent();
					default: return $(selector).parent();
				}
			})(),
			size=(function(){
				/*
				返回参照父元素所对应的尺寸属性
				宽及左右，对应width；高级上下，对应height
				absolute对应填充区，其它情况对应内容区
				*/
				var s=/width|left|right/i.test(attr) ? "Width":"Height";
				switch(position)
				{
					case "absolute": return "inner"+s;
					default: return s.toLowerCase();
				}
			})(),
			wholeSize=parent[size](),
			val1=original[attr],
			val2=terminal[attr],
			unit1=N.type(val1),
			unit2=N.type(val2);
		if(unit1=='%') original[attr]=N.per2float(val1) * wholeSize + 'px';
		else
		{//把非像素值转化成像素值，再除商后转百分比数
			var px=parseFloat(unit1=='px' ? val1 : N[unit1+"2px"](val1));
			original[attr]=N.float2per(px/wholeSize);	
		}
		return U.call(this,selector,original,terminal,true);
	}
	;
});