//shadow系列，text-shadow需要IE10+，box-shadow需要IE9+
define(function(require,exports,module){
	if(window.low) return false;
	var S=require("tools/S"),
		BAR=$.scrollbar,
		bt=['box','text'],
		C=require("tools/C"),
		U=require("tools/U"),
		N=require("tools/N")
		;
	for(var x in bt)
	{
		if(window.ie && window.ie<10 && bt[x]=='text') continue;
		BAR.extend(bt[x]+'Shadow',{
			key:'none',
			parse:function(database){
				var attr=this.name,
					box=/box/i.test(attr),
					valueAttrs='x,y,blur'.split(','),
					value=S.clear(database[attr]);
				/none/i.test(value) && (value='rgb(0,0,0) 0px 0px 0px'+(box ? ' 0px':''));
				var arr=value.split(' '),
					obj={
						x:0,
						y:0,
						blur:0,
						color:'rgba(0,0,0)'
					};
				box && (obj.spread=0,obj.inset=false,valueAttrs.push('spread'));
				for(var n in arr)
				{
					var v=arr[n],t;
					if(C.type(v)) obj.color=v;
					else if(/inset/i.test(v)) obj.inset=true;
					else if(/^(px|em|rem|[\s\S]{0})$/i.test(t=N.type(v)))
					{
						if(valueAttrs[0])
						{
							obj[valueAttrs[0]]=v;
							valueAttrs.shift();
						}
						else console.warn(attr,'中出现了多余的值',v);
					}
					else console.error(attr,'中出现了不可识别的值',v);
				}

				arr=[obj.color,obj.x,obj.y,obj.blur];
				box && arr.push(obj.spread) && obj.inset && arr.push('inset');
				database[attr]=arr.join(' ');
				arr=obj=valueAttrs=null;
			},
			unify:function(selector,original,terminal){
				var attr=this.name,
					val1=original[attr],
					val2=terminal[attr],
					arr1=val1.split(' '),
					arr2=val2.split(' ');
				for(var n in arr1)
				{
					if(/inset/i.test(arr1[n])) break;
					this.type= C.type(arr1[n]) ? 'color':'value';
					arr1[attr]=arr1[n];
					arr2[attr]=arr2[n];
					U.call(this,selector,arr1,arr2);
					arr1[n]=arr1[attr];
					arr2[n]=arr2[attr];
				}
				original[attr]=arr1.join(' ');
				terminal[attr]=arr2.join(' ');
				arr1=arr2=null;
			}
		})
	}
});