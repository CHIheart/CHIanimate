//文本类，fontSize，lineHeight，textIndent，letterSpacing，wordSpacing
define(function(require,exports,module){
	var BAR=$.scrollbar,
		U=require("tools/U"),
		N=require("tools/N"),
		P=require("tools/P"),
		units='px|em|rem|%';

	//基于父元素某个属性的值计算的百分比量
	function unify(selector,original,terminal,parentSize)
	{
		if(U.call(this,selector,original,terminal,true)) return true;
		var attr=this.name,
			val1=original[attr],
			val2=terminal[attr],
			type1=N.type(val1),
			type2=N.type(val2);
		parentSize=parseFloat(parentSize);
		if(type1=='%') original[attr]= N.per2float(val1) * parentSize + 'px';
		else original[attr]= N.float2per(parseFloat(val1)/parentSize);
		return U.call(this,selector,original,terminal,true);
	}
	//normal关键字的默认值
	function parse(database,defaultValue)
	{
		var attr=this.name;
		/normal/i.test(database[attr]) ?
			(database[attr]=defaultValue)
			: P.call(this,database);
	}
	//fontSize的百分比值，是基于直接父元素字号计算的
	BAR.extend('font-size',{
		units:units,
		negative:false,
		unify:function(selector,original,terminal){
			return unify.call(this,selector,original,terminal,$(selector).parent().css("fontSize"));
		}
	});
	//lineHeight的百分比值，是基于自身字号计算的，且接受纯数字，相当于百分比值的浮点数形式
	//lineHeight的初始值不会返回百分数，但是会返回纯数字（目前已知为IE9-），但以防万一，还是认为它会返回百分比数
	BAR.extend('lineHeight',{
		units:units,
		negative:false,
		keys:'normal',
		parse:function(database){
			parse.call(this,database,1.15);
		},
		unify:function(selector,original,terminal){
			var attr=this.name,
				val1=original[attr],
				val2=terminal[attr],
				type1=N.type(val1),
				type2=N.type(val2),
				com=/px|em|rem/i,//普通单位common
				com1=com.test(type1),
				com2=com.test(type2),
				size=parseFloat($(selector).css("fontSize")),
				fun;
			//因为百分比及纯数字都是对应本元素的字号，所以相当于em单位
			while(1)
			{
				//类型相等时终止循环
				if(type1 === type2)
				{
					original[attr]=val1;
					terminal[attr]=val2;
					return true;
				}
				//纯数字与百分比互转
				if(!com1 && !com2)
				{
					fun= type1 ? "per2float" : "float2per";
					original[attr]=N[fun](val1);
					return true;
				}
				//如果初始值为非常规，则转化为em单位
				else if(!com1)
				{
					//如果是百分比，先转纯数字
					if(type1) original[attr]=val1=N.per2float(val1);
					original[attr]=val1=val1+'em';
					type1='em';
					com1=true;//其实这句可以省略
				}
				//如果终值为非常规，则将初始值转化为em单位，并取数字部分
				else if(!com2)
				{
					original[attr]=val1=N.value(N[type1+'2em'](val1,selector));
					type1='';
					com1=false;
				}
				
				fun=type1+'2'+type2;
				//可以使用常规转化时终止循环
				if(fun in N)return U.call(this,selector,original,terminal);
			}
		}
	});
	//textIndent的百分比值是按照父元素的内容区计算的
	BAR.extend("text-indent",{
		units:units,
		unify:function(selector,original,terminal){
			var position=$(selector).css("position"),
				parent=(function(){
					//IE8-是按直接父元素计算，而其它浏览器按参照父元素计算
					if(window.low) return $(selector).parent();
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
					返回参照父元素的某项属性名，根据元素的position属性值有所区别
					一般是按照参数父元素的  内容区  宽计算的
					IE8-是按照直接父元素的  填充区  宽计算的
					*/
					return window.low ? 'innerWidth' : 'width';
				})();
			return unify.call(this,selector,original,terminal,parent[size]());
		}
	});
	//letterSpacing和wordSpacing
	var ss=['letterSpacing','wordSpacing'];
	for(var n in ss)
	{
		BAR.extend(ss[n],{
			keys:'normal',
			parse:function(database){
				parse.call(this,database,0);
			}
		})
	}
});