//border及outline
define(function(require,exports,module){
	var BAR=$.scrollbar,
		parseTRBL=require("tools/P_trbl"),
		STYLES='none|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit',
		WIDTHS='thin|medium|thick',
		WIDTHS_reg=new RegExp('^'+WIDTHS+'$','ig'),
		TRBL='Top,Right,Bottom,Left'.split(','),
		borders=(function(){
			var arr=[];
			for(var n in TRBL)
				arr.push('border'+TRBL[n]);
			arr.push('outline');
			return arr;
		})(),
		//火狐下没有整合属性，需要cssHook的get（set居然是可以的……）
		NEED=/firefox|msie/i.test(BROWSER),
		S=require("tools/S"),
		H_trbl=require("tools/H_trbl"),
		P=require("tools/P"),
		N=require("tools/N"),
		C=require("tools/C")
	;

	function parseWCS(database)
	{
		var attr=this.name,
			BAR=this.BAR,
			value=database[attr],
			arr=value===null ? [null] : value.split(' '),
			parts=this.parts,
			obj={};

		//删除总属性，将子属性放进去
		delete(database[attr]);
		for(var n in parts)
		{
			var sa=parts[n];
			if(!(sa in BAR)) console.error(sa,"属性不存在于插件中！");
			else obj[sa]=null;
		}
		for(var n in arr)
		{
			var v=arr[n],name='';
			if(!isNaN(v) || N.type(v) || WIDTHS_reg.test(v)) name='Width';
			else if(C.type(v)) name='Color';
			else name='Style';
			obj[attr+name]=v;
		}
		//低端下边会出现  widthKey none 的情况，为了效果准备，要把样式设置为null，width设置为0px
		if(obj[attr+'Style']=='none')
		{
			obj[attr+'Width']="0px";
		}
		for(var n in obj)
		{
			database[n]=obj[n];
			BAR[n].parse(database);
		}
		obj=arr=null;
	}

	//低端IE下的边框宽的关键字不会被翻译成像素值
	function WidthKey2Px(key){
		if(WIDTHS_reg.test(key))
		{
			switch(key)
			{
				case 'thin': return '1px';
				case 'medium': return '3px';
				case 'thick': return '5px';
			}
		}
		return key;
	}

	for(var n in borders)
	{
		var attr=borders[n];
		BAR.extend(attr+"Width",{
			hook:function(elem, computed, extra){
				return WidthKey2Px($(elem).css(this.name));
			},
			keys:WIDTHS,
			negative:false,
			parse:function(database){
				var attr=this.name,
					value=database[attr];
				if(P.call(this,database))
				{
					database[attr]=value;
					return true;
				}
				return false;
			}
		});
		BAR.extend(attr+"Color",{
			type:'color'
		});
		BAR.extend(attr+"Style",{
			type:'style',
			keys:STYLES
		});
		BAR.extend(attr,{
			hook:NEED ? H_trbl : $.noop,
			parts:[attr+"Width",attr+"Color",attr+"Style"],
			parse:parseWCS
		});
	}
	//弹出outline，只剩border的属性，以供下边使用
	borders.pop();

	var borderWCS=['Width','Color','Style'],
		borderParts=[];
	for(var n in borderWCS)
	{
		var parts=[],
			WCS=borderWCS[n],
			attr='border'+WCS;
		for(var m in TRBL)
		{
			parts.push('border' + TRBL[m] + WCS);
		}
		BAR.extend(attr,{
			hook:NEED ? H_trbl : $.noop,
			parts:parts,
			parse:parseTRBL
		});
		borderParts.push(attr);
		parts=null;
	}
	BAR.extend("border",{
		//当四条边框一样时返回字符串，否则返回解析好的对象
		hook:function(){
			var parts=this.parts;
			$.cssHooks["border"]={
				get:function(elem, computed, extra){
					var str=[];
					for(var n in parts)
						str.push($(elem).css(parts[n]));
					if(str[0]==str[1] && str[1]==str[2] && str[2]==str[3]) return str[0];
					str=null;
					str={};
					for(var n in parts)
						str[parts[n]]=$(elem).css(parts[n]);
					return str;
				}
			};
		},
		parts:borders,
		parse:function(database,selector){
			var value=database.border;
			if(typeof value=='string')
			{
				parseWCS.call(this,database);
			}
			else
			{
				delete(database.border);
				for(var n in value)
				{
					database[n]=S.clear(value[n]);
					this.BAR[n].parse(database);
				}
			}
		}
	});
	borderWCS=borderParts=borders=BAR=null;
});