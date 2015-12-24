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
		})()
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
			parts:[attr+"Width",attr+"Color",attr+"Style"],
			parse:parseWCS
		});
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
			parts:parts,
			parse:parseTRBL
		});
		borderParts.push(attr);
		parts=null;
	}
	BAR.extend("border",{
		parts:borderParts,
		parse:parseWCS
	});
	borderWCS=borderParts=borders=BAR=null;
});