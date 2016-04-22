//选色器
var CHIcolorPicker;
(function(){
	document.write('<div class="CHIcolorPicker">');
	document.write('<div class="tabs"><h5>METRO</h5><h5>RGBA</h5><q class="fa fa-times-circle"></q></div>');
	//////////METRO start
	document.write('<div class="metros contents">');
	var metros='252525,F4B300,78BA00,006AC1,001E4E,008287,691BB8,1FAEFF,1B58B8,2673EC,AE113D,632F00,2E1700,004D60,199900,004A00,00C13F,56C5FF,569CE3,00D8C0,00AAAA,B01E00,4E0000,4E0038,C1004F,7200AC,15992A,FF981D,E56C19,FF2E12,B81B1B,91D100,83BA1F,E1B700,D39D09,FF76BC,2D004E,4617B4,1F0068,FF1D77,B81B6C,AA40FF,E064B7,00A4A4,FF7D23,696969,FFFFFF,000000'.split(',');
	for(var n=0;n<metros.length;n++)
	{
		var color='#'+metros[n].toLowerCase();
		document.write('<b title="'+ color +'" style="background-color:'+ color +'"></b>');
	}
	document.write('</div>');
	//////////METRO over
	//////////RGBA start
	document.write('<div class="rgba contents">');
	document.write('<div>');
	document.write('<span>Red</span><input type="range" min="0" max="255" step="1" class="R-range" value="0"><input type="number" min="0" max="255" step="1" class="R-value" value="0">');
	document.write('</div><div>');
	document.write('<span>Blue</span><input type="range" min="0" max="255" step="1" class="G-range" value="0"><input type="number" min="0" max="255" step="1" class="G-value" value="0">');
	document.write('</div><div>');
	document.write('<span>Green</span><input type="range" min="0" max="255" step="1" class="B-range" value="0"><input type="number" min="0" max="255" step="1" class="B-value" value="0">');
	document.write('</div><div>');
	document.write('<span>Alpha</span><input type="range" min="0" max="1" step="0.01" class="A-range" value="1"><input type="number" min="0" max="1" step="0.01" class="A-value" value="1">');
	document.write('</div><div class="tip">');
	document.write('① 当Alpha不为1时，HEX输入框禁用<br>② HEX不合法时，采用RGBA面板数值');
	document.write('</div><div>');
	document.write('<span>HEX</span><u>#</u><input type="text" maxlength="6"><samp>3或6位16进制数</samp>');
	document.write('</div>');
	document.write('</div>');
	//////////RGBA over
	//////////Current
	document.write('<table class="current">');
	document.write('<tbody><tr><td width="50"><samp></samp</td><td width="230"></td></tr></tbody>');
	document.write('</table>');
	document.write('<div class="btns">');
	document.write('<input type="button" class="confirm" value="确定">');
	document.write('<input type="button" class="reverse" value="反转">');
	document.write('<input type="button" class="random" value="随机">');
	document.write('<input type="button" class="empty" value="留空">');
	document.write('</div>');
	document.write('</div>');
	
	if(!$(".FullScreen").size()) document.write('<table class="FullScreen"><tr><td></td></tr></table>');
	var FullScreen=$(".FullScreen").css({
		display:'none',
		zIndex:55555
	});
	CHIcolorPicker=$(".CHIcolorPicker").eq(0);
	CHIcolorPicker.appendTo(FullScreen.find("td"));
	
	var Rrange=$(".R-range",CHIcolorPicker),
		Grange=$(".G-range",CHIcolorPicker),
		Brange=$(".B-range",CHIcolorPicker),
		Arange=$(".A-range",CHIcolorPicker),
		Rvalue=$(".R-value",CHIcolorPicker),
		Gvalue=$(".G-value",CHIcolorPicker),
		Bvalue=$(".B-value",CHIcolorPicker),
		Avalue=$(".A-value",CHIcolorPicker),
		current=$(".current",CHIcolorPicker),
		sample=$("tbody td samp",current),
		values=$("tbody td:last",current),
		CURRENTINPUT,
		colorText=$(".rgba input[type=text]",CHIcolorPicker)
	;
	//调节RGBA面板上的滑块或数字区
	function skipped(){setSample();setText();}
	Rrange.change(function(){Rvalue.val(this.value);skipped();});
	Grange.change(function(){Gvalue.val(this.value);skipped();});
	Brange.change(function(){Bvalue.val(this.value);skipped();});
	Arange.change(function(){Avalue.val(this.value);skipped();});
	function correct(DOM){
		if(!/^\d+$/.test(DOM.value)) DOM.value=0;
		else
		{
			DOM.value=parseInt(DOM.value);
			if(DOM.value>255) DOM.value=255;
		}
	}
	Rvalue.on('input propertychange',function(){correct(this);Rrange.val(this.value);skipped();});
	Gvalue.on('input propertychange',function(){correct(this);Grange.val(this.value);skipped();});
	Bvalue.on('input propertychange',function(){correct(this);Brange.val(this.value);skipped();});
	//因为ALPHA可能只带点，输入到一半的时候是不符合规则的，所以只加到change事件中
	Avalue.change(function(){
		if(!/^([0-1]?\.\d+|[0-1](\.\d+)?)$/.test(this.value)) this.value=1;
		else
		{
			this.value=parseFloat(this.value);
			if(this.value>1) this.value=1;
		}
		Arange.val(this.value);
		skipped();
	});
	function isHEX(color){
		return /^[\#]?([0-9a-f]{3}){1,2}$/i.test(color);
	}
	function isRGB(color){
		return /^rgb\(\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\)$/i.test(color);
	}
	function isRGBA(color){
		return /^rgba\(\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*(([0-1]?\.\d+)|([0-1](\.\d+)?))\)$/i.test(color);
	}
	isColor=function(color){
		return isHEX(color) || isRGB(color) || isRGBA(color);
	}
	/*
	解析色彩值，返回对象，拥有的属性有
	r,g,b,a，十进制通道值
	rr,gg,bb，十六进制色彩通道值（小写）
	RR,GG,BB，十六进制色彩通道值（大写）
	hex/HEX，带#的hex色彩值，分别对应大小写
	*/
	function parseColor(color){
		var obj,text;
		if(isHEX(color))
		{
			text=color.replace('#','');
			if(text.length==3) obj={
				r:text[0]+text[0],
				g:text[1]+text[1],
				b:text[2]+text[2]
			}
			else obj={
				r:text.substr(0,2),
				g:text.substr(2,2),
				b:text.substr(4,2)
			}
			for(var n in obj)
			{
				var k=(n+n).toUpperCase();
				if(obj[n].length==1) obj[n]+=obj[n];
				obj[k]=obj[n].toUpperCase();
				obj[n]=parseInt(obj[n],16);
				obj[k.toLowerCase()]=obj[k].toLowerCase();
			}
			obj.a=1;
			obj.hex='#'+obj.rr+obj.gg+obj.bb;
			obj.HEX=obj.hex.toUpperCase();
		}
		else if(isRGB(color))
		{
			text=color.replace('rgb(','').replace(')','').split(',');
			obj={
				r:text[0],
				g:text[1],
				b:text[2]
			};
			for(var n in obj)
			{
				obj[n]=parseInt(obj[n]);
				if(obj[n]>255) obj[n]=255;
				var k=(n+n).toUpperCase();
				obj[k]=obj[n].toString(16);
				if(obj[k].length==1) obj[k]+=obj[k];
				obj[k.toLowerCase()]=obj[k].toLowerCase();
			}
			obj.a=1;
			obj.hex='#'+obj.rr+obj.gg+obj.bb;
			obj.HEX=obj.hex.toUpperCase();
		}
		else if(isRGBA(color))
		{
			text=color.replace('rgba(','').replace(')','').replace(' ','').split(',');
			obj={
				r:text[0],
				g:text[1],
				b:text[2]
			};
			for(var n in obj)
			{
				obj[n]=parseInt(obj[n]);
				if(obj[n]>255) obj[n]=255;
				var k=(n+n).toUpperCase();
				obj[k]=obj[n].toString(16);
				if(obj[k].length==1) obj[k]+=obj[k];
				obj[k.toLowerCase()]=obj[k].toLowerCase();
			}
			obj.a=parseFloat(text[3]);
			if(obj.a>1) obj.a=1;
			obj.hex='#'+obj.rr+obj.gg+obj.bb;
			obj.HEX=obj.hex.toUpperCase();
		}
		else obj={
			r:0,g:0,b:0,a:0,
			rr:0,gg:0,bb:0,
			RR:0,GG:0,BB:0,
			hex:'#000',HEX:'#000'
		};//不符合的颜色，返回纯透明
		return obj;
	}
	//将选色器的当前颜色设置成参数颜色
	function getColor(color){
		if(!isColor(color)) color='rgba(0,0,0,0)';
		var obj=parseColor(color);
		setSample(obj);
		setValues(obj);
		setText(obj);
	}
	/*
	返回rgb色彩串，可以使用的参数模式有
	1.含有r/g/b属性的对象
	2.任意一种色彩值，alpha会被忽略
	3.R/G/B三个参数
	*/
	function rgb(){
		var arg=arguments,obj={r:0,g:0,b:0};
		switch(arg.length)
		{
			case 1:
				if($.isPlainObject(arg[0]) && "r" in arg[0] && "g" in arg[0] && "b" in arg[0])
				{
					obj={
						r:arg[0].r,
						g:arg[0].g,
						b:arg[0].b
					};
					for(var n in obj)
					{
						obj[n]=parseInt(obj[n]);
						if(obj[n]==='') obj[n]=0;
						else obj[n]=Math.min(255,obj[n]);
					}
				}
				else if(isColor(arg[0]))
				{
					obj=parseColor(arg[0]);
				}
				break;
			case 3:
				var obj={
					r:arg[0],
					g:arg[1],
					b:arg[2]
				};
				for(var n in obj)
				{
					obj[n]=parseInt(obj[n]);
					if(obj[n]==='') obj[n]=0;
					else obj[n]=Math.min(255,obj[n]);
				}
				break;
			default:;
		}
		return 'rgb('+ obj.r +','+ obj.g +','+ obj.b +')';
	}
	/*
	返回rgba色彩串，可以使用的参数模式有
	1.含有r/g/b/a属性的对象，a可以没有，默认为1
	2.任意一种颜色值
	3.R/G/B三个参数，alpha为1
	4.R/G/B/A三个参数
	*/
	function rgba(){
		function alpha(value){
			obj.a=parseFloat(value);
			if(obj.a==='') obj.a=1;
			else if(obj.a>1) obj.a=1;
			else if(obj.a<0) obj.a=0;
		}
		var arg=arguments,obj={r:0,g:0,b:0,a:0};
		switch(arg.length)
		{
			case 1:
				if($.isPlainObject(arg[0]) && "r" in arg[0] && "g" in arg[0] && "b" in arg[0])
				{
					obj={
						r:arg[0].r,
						g:arg[0].g,
						b:arg[0].b
					};
					for(var n in obj)
					{
						obj[n]=parseInt(obj[n]);
						if(obj[n]==='') obj[n]=0;
						else obj[n]=Math.min(255,obj[n]);
					}
					alpha(arg[0].a);
				}
				else if(isColor(arg[0]))
				{//alpha参数缺省，解析出来的对象a=1
					obj=parseColor(arg[0]);
				}
				break;
			case 2:
				if(isColor(arg[0]))
				{
					obj=parseColor(arg[0]);
				}
				break;
			case 3:
				var obj={
					r:arg[0],
					g:arg[1],
					b:arg[2]
				};
				for(var n in obj)
				{
					obj[n]=parseInt(obj[n]);
					if(obj[n]==='') obj[n]=0;
					else obj[n]=Math.min(255,obj[n]);
				}
				obj.a=1;
				break;
			case 4:
				var obj={
					r:arg[0],
					g:arg[1],
					b:arg[2]
				};
				for(var n in obj)
				{
					obj[n]=parseInt(obj[n]);
					if(obj[n]==='') obj[n]=0;
					else obj[n]=Math.min(255,obj[n]);
				}
				alpha(arg[3]);
				break;
			default:;
		}
		return 'rgba('+ obj.r +','+ obj.g +','+ obj.b  +','+ obj.a +')';
	}
	/*
	返回hex色彩串，可以使用的参数模式有
	1.含有r/g/b属性的对象
	2.任意一种色彩值
	3.R/G/B三个参数
	*/
	function hex(){
		var arg=arguments,obj={r:0,g:0,b:0};
		switch(arg.length)
		{
			case 1:
				if("r" in arg[0] && "g" in arg[0] && "b" in arg[0])
				{
					obj={
						r:arg[0].r,
						g:arg[0].g,
						b:arg[0].b
					}
					for(var n in obj)
					{
						obj[n]=parseInt(obj[n]);
						if(obj[n]==='') obj[n]=0;
						else obj[n]=Math.min(255,obj[n]);
					}
				}
				else if(isColor(arg[0]))
				{
					obj=parseColor(arg[0]);
				}
				break;
			case 3:
				var obj={
					r:arg[0],
					g:arg[1],
					b:arg[2]
				};
				for(var n in obj)
				{
					obj[n]=parseInt(obj[n]);
					if(obj[n]==='') obj[n]=0;
					else obj[n]=Math.min(255,obj[n]);
				}
				break;
			default:;
		}
		for(var n in obj)
		{
			obj[n]=obj[n].toString(16);
			if(obj[n].length==1) obj[n]+=obj[n];
		}
		return '#'+obj.r+obj.g+obj.b;
	}
	/*
	重置颜色预览，可以使用的参数格式有
	1.没有参数时，使用RGBA面板的值
	2.有参数时，会是一个颜色对象
	如果当前颜色存在于METRO风格列表中，则选中
	*/
	function setSample(color){
		var obj,text;
		CHIcolorPicker.find(".metros b").removeClass("cur");
		if(color===undefined)
		{
			obj={
				r:Rrange.val(),
				g:Grange.val(),
				b:Brange.val(),
				a:Arange.val()
			};
		}
		else obj=color;
		sample.css('background-color',rgba(obj));
		if(obj.a==1)
		{//alpha为1时使用RGB及HEX，如果在METRO风格中存在则选中
			var hexValue=hex(obj);
			text=rgb(obj) +'&nbsp;&nbsp;'+ hexValue;
			$('.metros b[title="'+ hexValue +'"]').addClass('cur');
		}
		//alpha不为1时使用RGBA，没有HEX值
		else text=rgba(obj) +'&nbsp;&nbsp;'+ (obj.a>0 ? '' : 'transparent');
		values.html(text);
	}
	/*使用颜色对象设置RGBA面板上的四个数值*/
	function setValues(color){
		Rrange.add(Rvalue).val(color.r);
		Grange.add(Gvalue).val(color.g);
		Brange.add(Bvalue).val(color.b);
		Arange.add(Avalue).val(color.a);
	}
	//改变RGBA面板上的输入框
	function setText(color){
		var obj,text;
		if(color===undefined)
		{
			obj={
				r:Rrange.val(),
				g:Grange.val(),
				b:Brange.val(),
				a:Arange.val()
			};
			CHIcolorPicker.find(".metros b").removeClass("cur");
		}
		else obj=color;
		if(obj.a!=1)
		{
			colorText.prop('disabled',true).val('------');	
			return;
		}
		else
		{
			colorText.prop('disabled',false).val(hex(obj).replace('#',''));
		}
	}
	//在RGBA面板上输入HEX色彩值时
	colorText.on('input propertychange',function(){
		var value=this.value;
		if(!/^[\da-f]+$/i.test(value)) this.value=value.replace(/[^\da-f]/ig,'');
		value=this.value;
		if(value.length==3 || value.length==6)
		{
			var color=parseColor(value);
			setSample(color);
			setValues(color);
		}
	});
	//将选色器的当前颜色设置成input的颜色
	$(".tabs h5",CHIcolorPicker).click(function(){
		$(this).addClass("cur").siblings("h5").removeClass("cur");
		var index=$(this).index();
		$(".contents",CHIcolorPicker).eq(index).show()
			.siblings(".contents").hide();
	}).eq(0).click();
	//点击METRO风格色块
	$(".metros b",CHIcolorPicker).click(function(){
		$(this).addClass("cur").siblings().removeClass("cur");
		getColor($(this).css('background-color'));
	});
	//点击随机按钮
	$(".random",CHIcolorPicker).click(function(){
		function rand(){return Math.floor(Math.random()*255);}
		var r=rand(), g=rand(), b=rand(), a=1;//, a=Math.random().toFixed(2);
		getColor(rgba(r,g,b,a));
		CHIcolorPicker.find(".metros b").removeClass("cur");
	});
	//点击取消或关闭
	$(".tabs q",CHIcolorPicker).click(function(){
		CHIcolorPicker.close();
	});
	//点击反转
	$("input.reverse",CHIcolorPicker).click(function(){
		Rrange.val(255-Rrange.val());
		Grange.val(255-Grange.val());
		Brange.val(255-Brange.val());
		if(Arange.val()!=1)Arange.val(1-Arange.val());
		setSample();
	});
	//点击确定
	$("input.confirm",CHIcolorPicker).click(function(){
		var r=Rrange.val(), g=Grange.val(), b=Brange.val(), a=Arange.val(),
			color= a ? (a!=1 ? rgba(r,g,b,a) : hex(r,g,b)) : 'transparent',
			text= a ? (a!=1 ? color : (rgb(r,g,b) + '&nbsp;&nbsp;' + color)) : 'transparent';
		$(CURRENTINPUT).val(color)
			.parent()
			.find("i").css('background-color',color)
			.siblings("span").html(text);
		CHIcolorPicker.close();
	});
	//点击留空
	$("input.empty",CHIcolorPicker).click(function(){
		$(CURRENTINPUT).val('')
			.parent()
			.find("i").css('background-color','transparent')
			.siblings("span").text('transparent');
		CHIcolorPicker.close();
	});
	/////////////////////////////////////////////////////////////////////////////////////////公用方法
	//监听某个文本域，可以获取及设置其值（储存色彩值）
	CHIcolorPicker.focus=function(DOMinput){
		if(!DOMinput.tagName || DOMinput.tagName.toLowerCase()!='input')return false;
		CURRENTINPUT=DOMinput;
		getColor(DOMinput.value);
		function open(){
			$(".FullScreen").fadeIn(function(){
				CHIcolorPicker.fadeIn();
			}).find("td:first").children().hide();
		}
		if(typeof CHIbg=='undefined') open();
		else CHIbg.open(open);
	}
	CHIcolorPicker.close=function(){
		this.fadeOut(function(){
			$(".FullScreen").fadeOut();
			if(typeof CHIbg!='undefined') CHIbg.close();
		});
	}
})();
$(function(){
	function IsPC() {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
		var flag = true;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break;
			}
		}
		return flag;
	}
	//颜色选择器
	$("label.CHIcolors").each(function(){
		if(!$(this).data("value")) $(this).data('value','');
		var v=$(this).data("value"),
			value=isColor(v) ? v : '',
			i=$('<i class="fa fa-eyedropper"></i>').css('background-color',value).appendTo(this),
			span=$('<span>'+ (value ? value : 'transparent') +'</span>').appendTo(this),
			input=$('<input type="hidden" value="'+ value +'">').appendTo(this);
		$(this).removeData('value');
	})
	$("body").on((IsPC() ? 'click':'touchend'),'label.CHIcolors',function(){
		CHIcolorPicker.focus($(this).find("input").get(0));
	});
});
