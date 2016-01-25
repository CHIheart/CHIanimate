/*
background-position
1.IE8-无法使用backgroundPosition，需要cssHook
2.FF无法使用backgroundPositionX/Y，需要cssHook
3.不把backgroundPositionX/Y放置到可计算属性中，因为它们在纯CSS中不起作用
*/
define(function(require,exports,module){
	var N=require("tools/N"),
		U=require("tools/U"),
		units=/px|em|rem|%/i,
		bgp='backgroundPosition',
		dimension=require("tools/bgDimension");
	//IE8-无法使用$().css('backgroundPosition')
	window.low && ($.cssHooks[bgp]={
		get:function(elem, computed, extra){
			return $(elem).css(bgp+"X")+' '+$(elem).css(bgp+"Y");
		}
	});
	//FF无法使用$().css('backgroundPositionX/Y')
	window.BROWSER=='firefox' && (function(){
		var xy=['X','Y'];
		for(var n in xy)
			$.cssHooks[bgp+xy[n]]={
				index:n,
				get:function(elem, computed, extra){
					return $(elem).css(bgp).split(' ')[this.index];
				},
				set:function(elem, value){
					var bg=$(elem).css(bgp).split(' ');
					bg[this.index]=value;
					$(elem).css(bgp,bg.join(' '));
				}
			}
	})();
	$.scrollbar.extend(bgp,{
		parse:function(database){
			var attr=this.name,
				value=database[attr],
				arr=value.split(' ');
			if(arr.length==1) arr[/top|bottom/i.test(arr[0])?"unshift":"push"]('center');
			for(var n in arr)
			{
				var v=arr[n].toString().toLowerCase();
				if(N.type(v) || v=='0') continue;//可以使用有单位的值，不能使用纯数字，但可以使用0
				switch(v)
				{
					case 'center': v='50%'; break;
					case 'left':
					case 'top': v='0%'; break;
					case 'right':
					case 'bottom': v='100%'; break;
					default:
						console.error('bgp中使用了不能识别的值',v);
						delete(database.bgp);
						return false;
				}
				arr[n]=v;
			}
			database[attr]=arr.join(' ');
			arr=null;
		},
		unify:function(selector,original,terminal){
			var attr=this.name,
				val1=original[attr],
				val2=terminal[attr],
				arr1=val1.split(' '),
				arr2=val2.split(' '),
				pers=[];
			for(var n in arr1)
			{
				var v1=arr1[n],
					v2=arr2[n],
					type1=N.type(v1),
					type2=N.type(v2),
					b1=units.test(type1) || v1!=0,
					b2=units.test(type2) || v2!=0
					;
				if(!b1 && !b2)
				{
					delete(original[attr]);
					delete(terminal[attr]);
					!b1 && console.error(attr,"初始值中出现非法值",v1);
					!b2 && console.error(attr,"终止值中出现非法值",v2);
					return false;
				}
				arr1[attr]=v1;
				arr2[attr]=v2;
				if(!U.call(this,selector,arr1,arr2,true))
				{
					pers.push(n);
					continue;
				}
				arr1[n]=arr1[attr];
				arr2[n]=arr2[attr];
			}
			//如果出现百分比值的话，获取背景图片的尺寸之后，再转化百分比量为像素值
			if(pers.length){
				//在image对象上调用的方法，当图片可以获取正确的尺寸之后，计算背景图片占容器的百分比量
				function cal(){
					var //attr=this.attr,
						val1=original[attr],
						val2=terminal[attr],
						arr1=val1.split(' '),
						arr2=val2.split(' '),
						SIZES=dimension(/*this.*/selector),
						sizes=[this.width,this.height];
					for(var n in /*this.*/pers)
					{
						var index=/*this.*/pers[n],
							v1=arr1[index],
							v2=arr2[index],
							type1=N.type(v1),
							type2=N.type(v2),
							size=SIZES[index] - sizes[index];
						if(type1=='%') arr1[index]=N.per2float(v1) * size + 'px';
						else
						{
							var px=parseFloat(type1=='px' ? v1 : N[type1+'2px'](v1));
							arr1[index]=N.float2per(px/size);
						}
						arr1[attr]=arr1[index];
						arr2[attr]=arr2[index];
						U.call(attr,/*this.*/selector,arr1,arr2);
					}
					original[attr]=arr1.join(' ');
					terminal[attr]=arr2.join(' ');
					arr1=arr2=sizes=SIZES=img=null;
				}
				var src=$(selector).css("background-image");
				if(!src || /none/i.test(src)){
					console.error(selector,"没有背景图片，无法计算背景属性");
					return false;
				}
				src=src.replace(/url\(/,'').replace(/\)/,'').replace(/\"/ig,'');
				var img=new Image();
				img.src=src;
				//img.attr=this.name;
				//img.pers=pers;
				//img.selector=selector;
				img.width && img.height ? cal.call(img) : $(img).load(cal);
				
			}
			arr1=arr2=sizes=pers=null;
		}
	});
});