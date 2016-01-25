//background-size，CSS3的属性，IE9+支持
///////////////////////////////////////////////////////////////这个属性暂时放弃
/*
background-size
1.未设置时：
	1.1.在WEBKIT及IE下，返回auto
	1.2.在FF下，返回auto auto
2.计算过程使用使用双值
	2.1.单独的auto被转化成  auto auto
	2.2.关键字contain及cover
		2.2.1.容器过宽的cover，容器过窄的contain，被转化成  100% auto
		2.2.2.容器过窄的cover，容器过宽的contain，被转化成  auto 100%
	2.3.单独的数值被转化成  数值 auto
3.只有auto才能计算成auto，数值无法计算成auto
4.使用$.css获取backgroundSize（以下的“值”所指为百分比值/像素值/字号值）
	4.1.如果采用双值，且值中有百分比值
		4.1.1.Webkit及FF会直接返回百分比值
		4.1.2.IE9会返回像素值
	4.2.如果采用单值
		4.2.1.Webkit及IE9会返回单值，但IE9仍然只返回像素值
		4.2.2.FF会返回值及auto
	4.3.任意浏览器使用cover或contain都只返回此关键字
	4.4.使用“auto 值”的形式，任意浏览器都返回“auto 值”，但IE9仍然会只返回像素值

*/

define(function(require,exports,module){
	return false;
	if(window.low) return true;
	var N=require("tools/N"),
		U=require("tools/U"),
		dimension=require("tools/bgDimension"),
		units=/px|em|rem|%/i,				//可接受的单位
		keys=/^(cover|contain|auto)$/i		//可接受的关键字
		;
	$.scrollbar.extend('backgroundSize',{
		noresize:false,//默认为false，表示元素尺寸会变化，设置成true表示元素不会发生尺寸变化，可以使原本不能计算的过渡变得可计算
		parse:function(database){
			//这里不解析值，只判断值的合法性
			var attr=this.name,
				val=database[attr].toString().toLowerCase(),
				arr=val.split(' '),
				valid=true;
			switch(arr.length)
			{
				case 1:
					val=arr[0];
					//如果是一个数字，或一个可用值
					if(!isNaN(val) || units.test(N.type(val))) database[attr]=val+(!isNaN(val) ? 'px':'')+' auto';
					//如果也不是关键字的话，就不可用
					else valid=keys.test(val);
					break;
				case 2:
					for(var n in arr)
					{
						var v=arr[n];
						//两个值的时候，只能是值，或auto
						if(isNaN(v) && !/^auto$/i.test(v) && !units.test(N.type(v)))
						{
							valid=false;
							break;
						}
					}
					break;
				default: valid=false;
			}
			arr=null;
			!valid && console.error(this.name,'中出现不合法的值',val) && delete(database[attr]);
			return valid;
		},
		unify:function(selector,original,terminal){
			var src=dom.css("background-image");
			if(!src || /none/i.test(src)){
				console.error(selector,"没有背景图片，无法计算背景属性");
				return false;
			}
			var attr=this.name,
				img=new Image();
			//返回总值的类型，对比上边注释中的情况
			function type(val){
				return /^cover$/i.test(val) ? 9 :
					/^contain$/i.test(val) ? 10 :
					/^auto( auto)?$/i.test(val) ? 0 :
					(function(){
						//使用三进制计算类型，auto=>0，%=>1，val=>2
						var arr=val.split(' '),
							types=0;
						for(var n in arr)
						{
							var v=arr[n];
							types*=3;
							types+=/^auto$/i.test(v) ? 0 : N.type(v)=='%' ? 1 : 2;
						}
						arr=null;
						return types;
					})();
			}
			//翻译关键字，wider是指容器是否（比图片）过宽
			function trans(database,wider)
			{
				var v=database[attr].toLowerCase(),
					v1='100% auto',
					v2='auto 100%';
				switch(v)
				{
					case 'cover': v=wider ? v1:v2; break;
					case 'contain': v=wider ? v2:v1; break;
					case 'auto': v='auto auto'; break;
				}
				database[attr]=v;
			}
			function drop(){
				delete(original[attr]);
				delete(terminal[attr]);
				return false;
			}
			//真正计算值的时候
			function cal()
			{
				var val1=original[attr],
					val2=terminal[attr],
					type1=type(val1),
					type2=type(val2);
				if(type1==type2) return true;
				//当容器可能会变形时，不可使用cover或contain作为终值，因为不知道最终容器是什么形状
				if(!this.noresize && (type2>8)) return drop();
				//计算图片与容器各自的尺寸及比例
				try{
					var imgWH=[this.width,this.height],
						imgr=(imgWH[0]/imgWH[1]).toFixed(2),
						conWH=dimension(selector),
						conr=(conWH[0]/conWH[1]).toFixed(2),
						wider=conr>imgr;
				}
				catch(e){
					console.error("在计算尺寸的时候，可能获得了0值：图片尺寸",imgWH,'容器尺寸',conWH);
					return drop();
				}
				//将单值转化成双值
				trans(original,wider);
				trans(terminal,wider);
				//转化之后，cover跟contain可以被转化成1或3的形式
				val1=original[attr];
				val2=terminal[attr];
				type1=type(val1);
				type2=type(val2);
				//终值使用含有%的等比例值时，初值如果使用了双精确值，则必须也是等比例数字
				//Must Be Equal Ratio
				var MBER=!this.noresize && (type2==3 || type2==1) && (type1==7 || type1==8 || type==4 || type==5);
				if(type1==type2) return true;
				var arr1=val1.split(' '),
					arr2=val2.split(' ');
				//如果要强制等比例，就要先计算初值是否是等比例
				if(MBER)
				{
					var arr=[arr1[0],arr1[1]];
					for(var n in arr)
					{
						var v=arr[n],
							t=N.type(v);
						switch(t)
						{
							case 'em':
							case 'rem':
								arr[n]=N[t+'2px'](v);
								break;
							case '%':
								arr[n]=N.per2float(v) * conWH[n];
								break;
							default:;//case 'px':case '':
						}
					}
					if((parseFloat(arr[0])/parseFloat(arr[1])).toFixed(2)!=imgr)
					{
						console.error("初始背景图片不是等比例状态，但终止值是等比例，如果要强制计算，请将noresize设置为true或修改初始/终止值！");
						return drop();
					}
					arr=null;
				}
				/*
可能的值
0. auto( auto)
1. auto %
2. auto val
3. %( auto)
4. % %
5. % val
6. val( auto)
7. val %
8. val val
9. cover
10. contain

				*/
				for(var n in arr1)
				{
					val1=arr1[n];
					val2=arr2[n];
					if(val1==val2) continue;
					type1=N.type(val1);
					type2=N.type(val2);
				}
			}
			img.src=src;
			img.width && img.height ? cal.call(img) : $(img).load(cal);
		}
	});
	return ;
});