//首页启动
define(function(require,exports,module){
	require("jq/scrollbar");

	var BAR=$.scrollbar,
		C=require("tools/C"),
		N=require("tools/N"),
		STYLES='none|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit',
		TRBL='Top,Right,Bottom,Left'.split(','),
		borders=(function(){
			var arr=[];
			for(var n in TRBL)
				arr.push('border'+TRBL[n])
			arr.push('outline');
			return arr;
		})()
	;
	//////////////////////////////////////////////////////////////////////////////属性：outline（轮廓）及四个border（边框）
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
			parts:[attr+"Width",attr+"Color",attr+"Style"],
			parse:parseWCS
		});
	}
	//////////////////////////////////////////////////////////////////////////////属性：outline（轮廓）及四个border（边框）

	/*
	将属性拆分成带有width，color，style的子属性
	用于border及borderXXX，outline
	*/
	function parseWCS(database)
	{
		var attr=this.name,
			value=database[attr],
			arr=value.split(' '),
			parts=this.parts,
			obj={};
		database[attr]=obj;
		for(var n in parts)
		{
			var sa=parts[n];
			if(!(sa in BAR)) console.error(sa,"属性不存在于插件中！");
			else obj[sa]=null;
		}
		for(var n in arr)
		{
			var v=arr[n],name='';
			if(!isNaN(v) || N.type(v)) name='Width';
			else if(C.type(v)) name='Color';
			else name='Style';
			obj[attr+name]=v;
		}
		for(var n in obj)
		{
			BAR[n].parse(database[attr]);
		}
	}

	//////////////////////////////////////////////////////////////////////////////属性：padding（内填充）及margin（外边距）
	var mp=['padding','margin'];
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
				defaultValue:'0px'
			});
		}
		BAR.extend(attr,{
			units:'px|em|rem|%',
			parts:parts,
			parse:parseTRBL
		})
	}
	//////////////////////////////////////////////////////////////////////////////属性：padding（内填充）及margin（外边距）


	/*
	将属性拆分成带有top，right，bottom，left的子属性
	用于borderColor，borderWidth，borderStyle，padding，margin
	*/
	function parseTRBL(database,selector)
	{
		var attr=this.name,
			value=database[attr],
			arr=value.split(' '),
			parts=this.parts,
			obj={};
		database[attr]=obj;
		switch(arr.length)
		{
			case 1: arr.push(arr[0],arr[0],arr[0]); break;
			case 2: arr.push(arr[0],arr[1]); break;
			case 3: arr.push(arr[1]); break;
			case 4: break;
			default:
				console.log(attr,"值元素个数错误！")
				return false;
		}
		for(var n in TRBL)
		{
			var sa=attr.replace(/(border|padding|margin)/,'$1'+TRBL[n]);
			if(!(sa in BAR)) console.error(sa,"属性不存在于插件中！");
			else obj[sa]=arr[n];
		}
	}

	$("p").scrollbar({
		goal:{
			"margin":"10px 20px 30px 40px",
			"padding":"1em 20% 30px 40rem"
		}
	})
});