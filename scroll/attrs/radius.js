//容器圆角border-radius，IE9+
//它的百分比值是基于元素边框盒 border-box 的
define(function(require,exports,module){
	if(window.low) return true;
	var N=require("tools/N"),
		U=require("tools/U"),
		corners=['TopLeft','TopRight','BottomRight','BottomLeft'],
		BAR=$.scrollbar;
	for(var n in corners)
	{
		corners[n]='border'+corners[n]+'Radius';
		BAR.extend(corners[n],{
			units:'px|em|rem|%',
			parse:function(database,selector){
				var attr=this.name,
					val=database[attr],
					arr=val.split(' ');
				if(arr.length==1) arr[1]=arr[0];
				for(var n in arr)
				{
					if(!BAR.check(attr,arr[n]))
					{
						console.error(attr,'中有不合法的值',arr[n]);
						delete(database[attr]);
						return false;
					}
				}
				database[attr]=arr.join(' ');
			},
			unify:function(selector,original,terminal){
				var attr=this.name,
					val1=original[attr],
					val2=terminal[attr],
					arr1=val1.split(' '),
					arr2=val2.split(' '),
					wholeSize=[$(selector).outerWidth(),$(selector).outerHeight()];
				for(var n in arr1)
				{
					var v1=arr1[n],
						v2=arr2[n];
					arr1[attr]=v1;
					arr2[attr]=v2;
					if(!U.call(this,selector,arr1,arr2,true))
					{
						var type1=N.type(v1),
							type2=N.type(v2),
							whole=wholeSize[n];
						if(type1=='%') arr1[attr]=N.per2float(v1) * whole + 'px';
						else{
							var px=parseFloat(/px|/i.test(type1) ? v1 : N[type1+"2px"](v1));
							arr1[attr]=N.float2per(parseFloat(px)/whole);
						}
						U.call(this,selector,arr1,arr2);
					}
					arr1[n]=arr1[attr];
					arr2[n]=arr2[attr];
				}
				original[attr]=arr1.join(' ');
				terminal[attr]=arr2.join(' ');
				arr1=arr2=null;
			}
		});
	}
	BAR.extend('borderRadius',{
		parts:corners,
		parse:function(database){
			var attr=this.name,
				value=database[attr],
				values=value.indexOf('/')>0 ? value.split(/\s*\/\s*/gi) : [value,value];
			for(var n in values)
			{
				values[n]=values[n].split(' ');
				var v0=values[n][0];
				switch(values[n].length)
				{
					case 1: values[n].push(v0,v0,v0);break;
					case 2: values[n].push(v0,values[n][1]);break;
					case 3: values[n].push(values[n][1]);break;
					case 4: break;
					default:
						console.error(attr,'中出现不合法的值'+values[n]);
						delete(database[attr]);
						return false;
				}
			}
			for(var n in this.parts)
			{
				database[this.parts[n]]=values[0][n]+' '+values[1][n];
			}
			delete(database[attr]);
		}
	});
});