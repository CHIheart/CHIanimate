//JQ扩展，滚动条计算CSS属性
define(function(require,exports,module){
	var S=require("./tools/S"),
		N=require("./tools/N"),
		U=require("./tools/U"),
		P=require("./tools/P"),
		IS=require("./tools/IS");
	require("./tools/B");
	var defaultSettings={
		/*
		可选，用于统一属性单位的函数，接收的是对象选择器（一般为this），运算中转值original和terminal对象
		如果是只接收px/em/rem三个单位的话，就可以不用写，使用插件默认的这个，它会使用P工具将这三种值转化
		如果还要接收其它单位（大多数情况是%），就要自己写了
		*/
		unify:U,
		type:'value',						//默认为value值，还可以为color，style，matrix等
		hook:$.noop,						//非标准CSS属性必选，额外用于识别CSS属性的jq.cssHooks函数
		units:'px|em|rem',					//本CSS属性可接受的单位类型，在本单位数组之外的单位，将会被抛弃
		keys:'',							//本CSS属性可接受的关键字数组，非数值之外的其它字符串将会被抛弃
		parts:'',							//复合属性必选，本CSS属性的基元，有些属性是由多个属性缩合而成，比如说margin由margin-top/right/bottom/top四个属性组成
		parse:P, 							//复合属性解析终止值使用，除了要拆分子属性之外还要将各个属性解析出来，并补足缺少的属性
		negative:true						//属性是否可为负，有些属性是不能为负值的
		//assemble:$.noop 					//复合属性组装属性使用，一般情况下除了border不组装之外，其它的复合属性都组装一次
	};
	defaultSettings.BAR=$.scrollbar={
		/*
		其中，name属性是自动生成的驼峰属性名
		cssAttr:{
			name,
			type,
			hook,
			units,
			keys,
			parts,
			parse,
			unify,
			negative
		}
		*/
		extend:function(attr,settings){
			if(!attr) return false;
			attr=S.cammel(attr);
			if(attr in this) console.warn(attr,"属性已经在插件之中了……")
			this[attr]={
				name:attr
			};
			$.extend(this[attr], defaultSettings, settings);
			//如果有钩子则自动钩进去
			IS.f(this[attr].hook) && this[attr].hook();
			return this;
		},
		//检测基本属性值是否合法（单位以及关键字），复杂属性不使用本测试
		check:function(attr,value){
			var ATTR=this[attr];
			if(!ATTR) return false;
			switch(ATTR.type.toLowerCase())
			{
				//颜色只验证是否能找到符合的类型
				case 'color':
					var C=require("./tools/C");
					return !!C.type(value);
				//值如果是纯数字，则为真，否则需要验证单位及关键字，有一者符合则为真，还需要验证一下非负设置
				case 'value':
					if(!isNaN(value)) return true;
					var units=S.toRegExp(ATTR.units),
						keys=S.toRegExp(ATTR.keys);
					if(keys && keys.test(value)) return true;
					var type=N.type(value);
					return type!==false && units.test(type) && (ATTR.negative || value.indexOf('-')==-1);
				//样式只验证关键字
				case 'style':
					var keys=S.toRegExp(ATTR.keys);
					return keys.test(value);
				//矩阵暂时没写
				case 'matrix':
					console.info('还没有写矩阵的部分');
					return false;
			}
		}
	}
	/*
	配置参数可以使用的属性有
	goal，必选，最终样式，使用JSON对象，类似于$.css方法，不接受inherit跟auto
	start，样式变化起始位置，默认为0
	over，样式变化终止位置，默认为滚动到文档底，也就是文档高减去窗口高
	easing，样式变化缓冲函数，默认为linear，如果包含了jQuery.easing插件，也可以使用里边的其它函数
	step，样式每一次变化都执行的函数，默认为空，函数的this语境是元素的jq对象
	strict，严格执行，也就是当滚动到最终位置时，是否设置元素属性为goal，默认为false，会使用补足的goal（也就是内部的terminal对象）
	*/
	$.fn.scrollbar=function(settings){
		if(!settings)
		{
			$(window).off("scroll load",update);
			return this;
		}
		//滚动位置验证
		var start=settings.start,
			over=settings.over;
		if(isNaN(start)) start=0;
		if(isNaN(over)) over=$(document).height() - $(window).height();
		var duration=over-start;
		if(duration<=0){
			console.error("动画区间是非正数！");
			return this;	
		}
		//其它验证
		var easing=settings.easing,
			step=settings.step,
			goal=settings.goal,
			strict=!!settings.strict;
		if(!IS.o(goal)){
			console.error("最终样式参数错误！");
			return this;
		}
		if(!easing || !(easing in $.easing)) easing='linear';
		if(!IS.f(step)) step='';

		var init={},original={},terminal={},
			BAR=$.scrollbar,
			THIS=this;
		for(var n in goal)
		{
			var attr=S.cammel(n);
			if(!(attr in BAR))
			{
				console.warn(attr,"不在可运算的属性中……");
				continue;
			}
			if(isNaN(goal[n]) && !IS.s(goal[n]))
			{
				console.error("属性只能使用数字或字符串作为值！",goal[n]);
				continue;
			}
			if(/inherit|auto/i.test(goal[n]))
			{
				console.error("终止值不接受inherit或auto！");
				continue;
			}
			init[n]=$(this).css(n);
			original[attr]=S.clear(init[n]);
			terminal[attr]=S.clear(goal[n]);
			BAR[attr].parse(original,this);
			BAR[attr].parse(terminal,this);
		}
		//console.group("初始读值");
		console.warn("统一之前初始值");
		CONSOLE(original)
		console.warn("统一之前终止值");
		CONSOLE(terminal)
		//console.groupEnd();

		for(var n in original)
		{
			if(!(n in terminal))
			{
				console.warn("属性"+n+"不存在于终止值对象之中！已删除！");
				delete(terminal[n]);
			}
				BAR[n].unify(THIS,original,terminal);
		}
		//console.group("统一后的值");
		console.warn("统一之后初始值");
		CONSOLE(original)
		console.warn("统一之后终止值");
		CONSOLE(terminal)
		//console.groupEnd();
		
		return this;
		$(window).on('scroll load', update);
		function update()
		{
			var scrollTop=$(window).scrollTop();
			if(scrollTop>over || scrollTop<start) return;
			if(scrollTop==over && strict) THIS.css(goal);
			else if(scrollTop==start) THIS.css(init);
			else
			{
				var current={},
					curStep=scrollTop-start;
				for(var attr in original)
				{
					//如果是对象，则分别计算tween值
					if(IS.o(original[attr]))
					{
						var startObj=original[attr],
							overObj=terminal[attr],
							cssObj={};
						for(var subAttr in startObj)
						{
							cssObj[subAttr]=tween(easing,curStep, startObj[subAttr], overObj[subAttr], duration);
						}
						$.extend(current, cssObj);
					}
					else current[attr]=tween(easing,curStep, original[attr], terminal[attr], duration);
				}
				THIS.css(current);
			}
		}
	}
	return;
});