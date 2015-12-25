//border及outline
define(function(require,exports,module){
	var BAR=$.scrollbar,
		parseWCS=require("tools/P_wcs"),
		parseTRBL=require("tools/P_trbl"),
		STYLES='none|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit',
		TRBL='Top,Right,Bottom,Left'.split(','),
		borders=(function(){
			var arr=[];
			for(var n in TRBL)
				arr.push('border'+TRBL[n]);
			arr.push('outline');
			return arr;
		})(),
		//火狐下没有整合属性，需要cssHook的get（set居然是可以的……）
		FIREFOX=BROWSER=='firefox',
		S=require("tools/S")
	;
	for(var n in borders)
	{
		var attr=borders[n];
		BAR.extend(attr+"Width",{
			defaultValue:'0px'
		});
		BAR.extend(attr+"Color",{
			type:'color',
			defaultValue:'black'
		});
		BAR.extend(attr+"Style",{
			type:'style',
			keys:STYLES
		});
		BAR.extend(attr,{
			hook:FIREFOX ? combine : $.noop,
			parts:[attr+"Width",attr+"Color",attr+"Style"],
			parse:parseWCS
		});
	}
	//弹出outline，只剩border的属性，以供下边使用
	borders.pop();
	
	//Firefox下必须要组合复合属性，它们可以set但不可以get，所以要手动写
	function combine()
	{
		var attr=this.name,
			parts=this.parts;
		$.cssHooks[attr]={
			get: function(elem, computed, extra){
				var str=[];
				for(var n in parts)
					str.push($(elem).css(parts[n]));
				//四属性，返回合并属性
				if(str.length==4)
				{
					if(str[3]==str[1])
					{
						str.pop();
						if(str[2]==str[0])
						{
							str.pop();
							if(str[1]==str[0])
								str.pop();
						}
					}
				}
				return str.join(' ');
			}
		}
	}


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
			hook:FIREFOX ? combine : $.noop,
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
				delete(database.border)
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