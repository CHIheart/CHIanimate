/*
颜色变化效果
JQobj，使用JQ获取的对象
attr，可以获取到纯颜色值的css属性
val，新的颜色
settings，参数对象，可以使用的属性有
	step，颜色变化步数，默认为10，越大变化越慢
	speed，颜色变化速度，默认为50ms，越大变化越慢
IE6不支持String[index]来获取字符
*/
function CHIcolor(JQobj,attr,val,settings)
{
	var str_hex=/^[\#]?([abcdef\d]{3}){1,2}$/i;
	var str_rgb=/rgb\([\d]{1,3}\,[\d]{1,3}\,[\d]{1,3}\)/i;
	if(!settings)settings={};
	function dec(v){return (Number)("0x"+v).toString(10);}
	function hex(v){return (Number)(v).toString(16);}
	function fill(v){v=(String)(v);return (v.length<2?'0':'') + v;}
	var pc/*primary color*/=JQobj.css(attr);
	function rgb2obj(v)
	{
		var rgb=v;
		rgb=rgb.replace('rgb(','');
		rgb=rgb.replace(')','');
		rgb=rgb.split(',');
		return {r:rgb[0],g:rgb[1],b:rgb[2]};
	}
	pc=isColor(pc)=='hex'?hex2obj(pc):rgb2obj(pc);
	function isColor(v)
	{
		if(str_hex.test(v))return 'hex';
		if(!str_rgb.test(v))return false;
		var obj=rgb2obj(v);
		if(v.r<0 || v.r>255 || v.g<0 || v.g>255 || v.b<0 || v.b>255)return false;
		return 'rgb';
	}
	var gc=isColor(val);
	if(!gc)return false;
	function hex2obj(v)
	{
		var col=v;
		col=col.replace('#','');
		if(col.length==3) return {
			r:dec(col.charAt(0)+col.charAt(0))
			,g:dec(col.charAt(1)+col.charAt(1))
			,b:dec(col.charAt(2)+col.charAt(2))
		};
		else if(col.length==6) return {
			r:dec(col.charAt(0)+col.charAt(1))
			,g:dec(col.charAt(2)+col.charAt(3))
			,b:dec(col.charAt(4)+col.charAt(5))
		}
		else return false;
	}
	gc=gc=='hex'?hex2obj(val):rgb2obj(val);
	var step=settings.step?settings.step:10;
	var speed=settings.speed?settings.speed:50;
	var delta={
		r:(gc.r-pc.r)/step
		,g:(gc.g-pc.g)/step
		,b:(gc.b-pc.b)/step
	};
	
	var cnt=1;
	function color(JQobj,attr,val){JQobj.css(attr,val);}
	JQobj.timer=setInterval(function(){
		var c={
			r:Math.round(pc.r*1 + cnt * delta.r)
			,g:Math.round(pc.g*1 + cnt * delta.g)
			,b:Math.round(pc.b*1 + cnt * delta.b)
		};
		c="#" + fill(hex(c.r))  + fill(hex(c.g))  + fill(hex(c.b));
		color(JQobj,attr,c);
		cnt++;
		if(cnt>step) {clearInterval(JQobj.timer);}
	},speed);
}
/*
仿JQ格式的函数，可以使用参数列表（属性，值，设置）或（键值对，设置）的格式
无法加入delay队列中，是独立出来的，可以改变颜色，使用HEX值或RGB值，暂不支持RGBA
与$.css一样，border/outline等需要写到最详细的属性名，例如borderTopColor
*/
$.fn.color=function(attr,val,settings){
	var str_hex=/^[\#]?([abcdef\d]{3}){1,2}$/i;
	var str_rgb=/rgb\([\d]{1,3}\,[\d]{1,3}\,[\d]{1,3}\)/i;
	function dec(v){return (Number)("0x"+v).toString(10);}
	function hex(v){return (Number)(v).toString(16);}
	function fill(v){v=(String)(v);return (v.length<2?'0':'') + v;}
	function rgb2obj(v)
	{
		var rgb=v;
		rgb=rgb.replace('rgb(','');
		rgb=rgb.replace(')','');
		rgb=rgb.split(',');
		return {r:rgb[0],g:rgb[1],b:rgb[2]};
	}
	function isColor(v)
	{
		if(str_hex.test(v))return 'hex';
		if(!str_rgb.test(v))return false;
		var obj=rgb2obj(v);
		if(v.r<0 || v.r>255 || v.g<0 || v.g>255 || v.b<0 || v.b>255)return false;
		return 'rgb';
	}
	function hex2obj(v)
	{
		var col=v;
		col=col.replace('#','');
		if(col.length==3) return {
			r:dec(col.charAt(0)+col.charAt(0))
			,g:dec(col.charAt(1)+col.charAt(1))
			,b:dec(col.charAt(2)+col.charAt(2))
		};
		else if(col.length==6) return {
			r:dec(col.charAt(0)+col.charAt(1))
			,g:dec(col.charAt(2)+col.charAt(3))
			,b:dec(col.charAt(4)+col.charAt(5))
		}
		else return false;
	}
	
	
	if(typeof attr == 'object')
	{
		for(var it in attr)
		{
			this.color(it,attr[it],val);
		}
	}
	else if(typeof attr == 'string' && typeof val == 'string')
	{
		var obj=this;
		if(!settings)settings={};
		var pc/*primary color*/=obj.css(attr);
		pc=isColor(pc)=='hex'?hex2obj(pc):rgb2obj(pc);
		var gc=isColor(val);
		if(!gc)return false;
		gc=gc=='hex'?hex2obj(val):rgb2obj(val);
		var step=settings.step?settings.step:50;
		var speed=settings.speed?settings.speed:10;
		var delta={
			r:(gc.r-pc.r)/step
			,g:(gc.g-pc.g)/step
			,b:(gc.b-pc.b)/step
		};
		
		var cnt=1;
		if(!obj.timers) obj.timers={};
		if(!obj.timers[attr])
		obj.timers[attr]=setInterval(function(){
			var c={
				r:Math.round(pc.r*1 + cnt * delta.r)
				,g:Math.round(pc.g*1 + cnt * delta.g)
				,b:Math.round(pc.b*1 + cnt * delta.b)
			};
			c="#" + fill(hex(c.r)) + fill(hex(c.g)) + fill(hex(c.b));
			obj.css(attr,c);
			cnt++;
			if(cnt>step) {clearInterval(obj.timers[attr]);obj.timers[attr]=0;}
		},speed);
		return obj;
	}
}
