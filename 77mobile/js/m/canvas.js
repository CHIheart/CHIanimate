/*
创建画布，画布的css样式不可以有尺寸限制，只能在创建画布的时候设置或在canvas的HTML上使用属性设置，不然会出现拉伸变形
DOMid，此DOM必须是canvas元素
width/height，画布最终的尺寸，默认为800*600
*/
function CHIcanvas(DOMid)
{
	var o=document.getElementById(DOMid);
	if(o.tagName.toLowerCase()!='canvas')return false;
	var PI=Math.PI;
	var ptn_percentage=/^[\d]+(\.[\d]+)?\%$/;
	var p=o.getContext("2d");
	function isArray(o){return o && o.constructor==Array;}
	function isPos(n){return n && !isNaN(n) && n>0;}
	function isObject(o){return typeof o =='object';}
	function cos(t){return Math.cos(t);}
	function sin(t){return Math.sin(t);}
	function tan(t){return Math.tan(t);}
	function acos(t){return Math.acos(t);}
	function asin(t){return Math.asin(t);}
	function atan(t){return Math.atan(t);}
	function int(n){return parseInt(n);}
	function bool(n){return (Boolean)(n);}
	function float(n){return parseFloat(n);}
	/*
	canvas点对象测试，要么是一个有x与y属性的对象，要么是有两个值的数组
	canvas的点有可能有r属性（数组第三值），up属性（数组第四值）
	*/
	var isPoint=function(obj){
		if(isArray(obj))
		{
			if(obj[0]==undefined && obj[1]==undefined) return false;
			if(obj[2]) obj.r=obj[2]; if(obj[3]) obj.up=true;
			obj.x=obj[0]; obj.y=obj[1]; return true;
		}
		else return (typeof obj=='object') && ("x" in obj) && ("y" in obj);
	}
	var isSamePoint=function(a,b){return a.x==b.x && a.y==b.y;}
	var isLine3P=function(a,b,c){return (a.x - b.x) * (c.y - b.y) == (c.x - b.x) * (a.y - b.y);}
	/*
	Percentages型的对象，可以是以下几种类型
	gradient使用的对象形式
		Object{percent1:color1,percent2:color2...}
		Array[color]，全部是一种颜色
		Array[color0,color1]，元素0是0%位置的颜色，元素1是100%位置的颜色
	pie()使用的对象形式
		Array[[percentage,color]]
		Array[{percentage:color}]
	percentage可以是0-1之间的数字，也可以是0-100%之间的百分数
	*/
	var isPers=function(o){
		if(isArray(o))
		{
			if(!o.length)return false;
			return bool(o[0]);
		}
		else if(isObject(o))
		{
			var cnt=0;
			for(var attr in o)
			{
				var v=o[attr];
				if(isNaN(attr))
				{//不是数字就必须是百分数
					if(!ptn_percentage.test(attr)) return false;
					attr=float(attr)*0.01;
				}
				if(attr>1 || attr<0)return false;
				cnt++;
			}
			return cnt>0;
		}
		return false;
	}
	/*
	被矩形、圆形、线调用的画图过程
	如果笔触与填充都不存在，则生成默认笔触，使用参数对象中的width/join/miter/style四个参数
	首先判断参数中的阴影，有阴影的话，如果有笔触则应用在笔触上，没有笔触则应用在填充上
	（如果有笔触）然后使用笔触画出图形的外框，并应用阴影，笔触完成后取消阴影，防止在填充上阴影重复
	（如果有填充）最后使用填充，如果阴影没被使用过的话，使用阴影
	最后取消阴影（如果有阴影）
	*/
	var draw=function(para){
		//如果笔触与填充都为空，则生成默认笔触
		if(!para)para={};
		var width=para.width && isPos(para.width) ? para.width : 1;
		var style=para.style ? para.style : '#000';
		var join=para.join ? para.join : 'miter';
		var miter=para.miter && isPos(para.miter) ? para.miter : 10;

		if(!para.stroke && !para.fill)
		{
			para.stroke={
				use:function(){
					p.lineWidth=width;
					p.strokeStyle=style;
					p.lineJoin=join;
					if(join=='miter') p.miterLimit=miter;
				}
			};
			para.stroke.name='stroke';
		}
		if(para.shadow && para.shadow.use) var shadow=para.shadow;
		var shadowUsed=false;
		if(para.stroke)
		{
			if(shadow)shadow.use();
			shadowUsed=true;
			var st=para.stroke;
			if(st.name=='stroke') st.use();
			else
			{
				p.lineWidth=width;
				p.strokeStyle=style;
				p.lineJoin=join;
				if(join=='miter') p.miterLimit=miter;
				//在应用非笔触对象作为笔触时，不可忽略额外定义的笔触样式
				if(st.name=='gradient' || st.name=='pattern') p.strokeStyle=st.get();
				else p.strokeStyle=st;
			}
			p.stroke();
			if(shadow)shadow.drop();
		}
		if(para.fill)
		{
			if(shadow && !shadowUsed)shadow.use();
			var f=para.fill;
			if(f.name=='gradient' || f.name=='pattern') p.fillStyle=f.get();
			else p.fillStyle=para.fill;
			p.fill();
		}
	}
	/*
	画线，参数对象中，可以使用
		.cap，线段的端点形状，默认为butt平直的端点，还可以为round圆形，square正方形
		.close，默认为false，不形成封闭的图形；如果为true，则形成封闭的图形
		.width，线宽，默认为1
		.style，线样式，默认为#000，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
		.join，边角样式，默认为miter尖角，还可以为bevel斜角，round圆角
		.miter，边角宽度，只当join=miter时有效，默认为10
		.stroke，路径颜色，默认为无路径，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
			有stroke属性将忽略width/style/join/miter四项属性
		.fill，填充颜色，默认为无填充，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
	points参数，为数组，每个元素是一个点{x:x,y:y}或[x,y]对象
		则至少要有两个点为一条线段的起始点/终止点
		数组中有不合法的"点"会停止画图，打断画路径效果
		数组中的点，如果有r属性，则会画出圆角接线，使用的是贝塞尔曲线
		数组中的点，如果有up属性，则在画完本点之后抬笔up=true，只有两点时忽略up属性
		如果起始点/终止点有r属性，且非闭合图形的话，会被忽略；闭合图形就会采用终止点/起始点，作为起始点/终止点的上一点/下一点
		只有两个点的线不考虑圆角
	*/
	this.line=function(points,para){
		if(!para)para={};
		var close=para.close ? para.close : false;
		if(!points || !points.length)return false;
		p.lineCap=para.cap ? para.cap : "butt";
		
		p.beginPath();
		var up=true;//抬笔，抬笔时使用moveTo，落笔时使用lineTo
		var l=points.length;
		function pen(pt){
			if(up) p.moveTo(pt.x,pt.y);
			else p.lineTo(pt.x,pt.y);
			if(pt.up) up=true; else up=false;
		}
		if(l==2)
		{
			if(!isPoint(points[0]) || !isPoint(points[1])) return false;
			var p0=points[0],p1=points[1];
			p.moveTo(p0.x,p0.y);
			p.lineTo(p1.x,p1.y);
		}
		else for(var n=0;n<l;n++)
		{
			var pt=points[n];
			if(!isPoint(pt)) break;
			if(isPos(pt.r))//有圆角
			{
				var pn/*point next*/=points[(n+1)%l],
					pp/*point prev*/=points[(n-1+l)%l];
				if(!isPoint(pn) || !isPoint(pp)) break;
				var ps=this.calArc(pp,pt,pn,pt.r);
				var pa=ps[0],pb=ps[1];
				pen(pa);
				p.quadraticCurveTo(pt.x,pt.y,pb.x,pb.y);
				if(pt.up) up=true; else up=false;
			}
			else pen(pt);//无圆角
		}
		if(close)p.closePath();
		draw(para);
	}
	//画任意多边形，如果ps中的点没定义过r值，则使用para中的r值（如果有的话）
	this.polygon=function(ps,para){
		if(!isArray(ps))return false;
		if(!para)para={};
		var r= para.radius ? para.radius : 0;
		if(r) for(var n=0;n<ps.length;n++)
		{
			ps[n].r=r;
		}
		para.close=true;
		this.line(ps,para);
	}
	/*
	画矩形，
		start，必选，{x:x,y:y}对象或[x,y]数组，矩形的左上角
		size，必选，{x:x,y:y}对象或[x,y]数组，矩形的尺寸
	para，参数对象中，可以使用
		.shadow，阴影效果对象，默认为无阴影，阴影会优先使用在笔触上，没有笔触则使用在填充上
		.width，线宽，默认为1
		.style，线样式，默认为#000，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
		.join，边角样式，默认为miter尖角，还可以为bevel斜角，round圆角
		.miter，边角宽度，只当join=miter时有效，默认为10
		.stroke，路径颜色，默认为无路径，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
			有stroke属性将忽略width/style/join/miter四项属性
		.fill，填充颜色，默认为无填充，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
	*/
	this.rect=function(start,size,para){
		if(!isPoint(start) || !isPoint(size))return false;
		if(!para)para={};
		p.beginPath();
		p.rect(start.x,start.y,size.x,size.y);
		draw(para)
	}
	/*
	画圆或圆的一部分：circle圆，sector扇形，bow弓形，arc任意弧状（如果para.close=false时）
		.cp，必选，{x:x,y:y}对象或[x,y]数组，圆心坐标
		.r，必选，圆的半径
		.start，有则必选，开始的角度，canvas圆上的角度，右端点为0，下端点为90，左端点为180，上端点为360
		.over，有则必选，终止的角度
	para参数对象中，可以使用
		.clock，默认为true，顺时针画；否则为逆时针画
			*****圆的起止角，不会随着clock的状态改变，如果从0画到270，顺时针就是四分之三圆的扇形（缺右上角），逆时针就是四分之一圆的扇形（只有右上角）
		.close，默认为false，不形成封闭的图形；如果为true，则形成封闭的图形
		.shape，当不是画圆的时候，且close=true时，形成的形状
			默认为sector扇形，弧的两个末端与圆心相连；
			还可以为bow弓形，弧的两个末端自行相连
		.shadow，阴影效果对象，默认为无阴影，阴影会优先使用在笔触上，没有笔触则使用在填充上
		.width，线宽，默认为1
		.style，线样式，默认为#000，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
		.join，边角样式，默认为miter尖角，还可以为bevel斜角，round圆角
		.miter，边角宽度，只当join=miter时有效，默认为10
		.stroke，路径颜色，默认为无路径，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
			有stroke属性将忽略width/style/join/miter四项属性
		.fill，填充颜色，默认为无填充，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
	*/
	this.circle=function(cp,r,para){
		if(!isPoint(cp) || !isPos(r))return false;
		if(!para)para={};
		this.arc(cp,r,0,360,para);
	}
	this.sector=function(cp,r,start,over,para){
		if(!isPoint(cp) || !isPos(r) || start==undefined || over==undefined)return false;
		if(!para)para={};
		para.shape='sector';
		para.close=true;
		this.arc(cp,r,start,over,para);
	}
	this.bow=function(cp,r,start,over,para){
		if(!isPoint(cp) || !isPos(r) || start==undefined || over==undefined)return false;
		if(!para)para={};
		para.shape='bow';
		para.close=true;
		this.arc(cp,r,start,over,para);
	}
	this.arc=function(cp,r,start,over,para){
		if(!isPoint(cp) || !isPos(r) || start==undefined || over==undefined)return false;
		if(!para)para={};
		var clock="clock" in para ? para.clock : true;
		var close=para.close ? para.close : false;
		var x=cp.x,y=cp.y;
		var start=start * PI/180,
			over=over * PI/180;
		p.beginPath();
		p.arc(x,y,r,start,over,!clock);
		if(close)
		{
			if(para.shape=='sector') p.lineTo(x,y);
			p.closePath();
		}
		draw(para)
	}
	/*
	文本绘制，并返回文本在画布上的宽度
	text，必选，文本内容
	point，必选，{x:x,y:y}对象或[x,y]数组，文本对齐的标准点
	para，参数对象中，可以使用
		.italic，默认为false，为true则使用斜体
		.small，默认为false，为true则使用小型大写字母
		.bold，默认为false，为true则使用粗体
		.size，默认为10，字号的px值
		.family，默认为sans-serif，字体名称
		.align，默认为left，则文本在标准点的右侧；还可以为center，文本中心在标准点上；为right，文本在标准点的左侧
		.vAlign，默认为alphabetic，使用英文本（英文本上一行一共有三格四条线）的第三线对齐标准点，还可以为
			top第一线；bottom第四线；middle中线；hanging好像跟top是一样的，并不是第二线
		.width，默认为0，边线宽
		.shadow，阴影效果对象，默认为无阴影，阴影会优先使用在笔触上，没有笔触则使用在填充上
		.stroke，路径颜色，默认为无路径，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
		.fill，填充颜色，默认为无填充，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
		stroke与fill至少要有其中一项，也可以两项都有
	*/
	this.text=function(text,point,para){
		if(!text || !isPoint(point) || !para || !para.fill && !para.stroke)return false;
		if(!para)para={};
		var x=point.x,y=point.y;
		var italic=para.italic ? bool(para.italic) : false;
		var small=para.small ? bool(para.small) : false;
		var bold=para.bold ? bool(para.bold) : false;
		var family=para.family ? para.family : "sans-serif";
		var size=isPos(para.size) ? int(para.size) : 10;
		var align=para.align ? para.align : "left";
		var vAlign=para.vAlign ? para.vAlign : "alphabetic";
		if(para.width && isPos(para.width)) p.lineWidth=para.width;
		p.font=(italic ? "oblique":"normal")+' '
			+(small ? "small-caps":"normal")+' '
			+(bold ? "bold":"normal")+' '
			+size+'px '
			+family
		;
		p.textAlign=align;
		p.textBaseline=vAlign;
		if(!para.stroke && !para.fill)
		{
			para.stroke=this.get.stroke(para);
		}
		if(para.shadow && para.shadow.use) var shadow=para.shadow;
		var shadowUsed=false;
		if(para.stroke)
		{
			if(shadow)shadow.use();
			shadowUsed=true;
			var st=para.stroke;
			if(st.name=='stroke') st.use();
			else if(st.name=='gradient' || st.name=='pattern') p.strokeStyle=st.get();
			else p.strokeStyle=para.stroke;
			p.strokeText(text,x,y);
			if(shadow)shadow.drop();
		}
		if(para.fill)
		{
			if(shadow && !shadowUsed)shadow.use();
			var f=para.fill;
			if(f.name=='gradient' || f.name=='pattern') p.fillStyle=f.get();
			else p.fillStyle=para.fill;
			p.fillText(text,x,y);
		}
		return p.measureText(text).width;
	}
	/*
	获取特效的入口，可以获取的效果有
		stroke，笔触，使用时用obj.use()启用笔触
		gradient，过渡色，使用时用strokeStyle/fillStyle=obj.get()
		pattern，样式，使用时用strokeStyle/fillStyle=obj.get()
		shadow，阴影，使用时用obj.use()启用阴影，取消时用obj.drop()取消阴影
	*/
	this.get=function(name,para){
		if(!para)para={};
		var o=new Object();
		o.clone=function(){
			var copy=new Object();
			for(var i in this)
			{
				copy[i]=this[i];
			}
			return copy;
		}
		switch(name)
		{
			/*
			创建阴影效果对象，参数对象中，可以使用
				.color，阴影的颜色，默认为#f00
				.blur，阴影的晕度，默认为0
				.x，阴影的右偏移，默认为0
				.y，阴影的下偏移，默认为0
			*/
			case "shadow":
				o.color=para.color ? para.color : '#f00';
				o.blur=para.blur && isPos(para.blur) ? para.blur : 0;
				o.x=para.x ? para.x : 0;
				o.y=para.y ? para.y : 0;
				o.use=function(){
					p.shadowColor=this.color;
					p.shadowBlur=this.blur;
					p.shadowOffsetX=this.x;
					p.shadowOffsetY=this.y;
				}
				o.drop=function(){
					p.shadowBlur=0;
					p.shadowOffsetX=0;
					p.shadowOffsetY=0;
					p.shadowColor=null;
				}
				o.name='shadow';
				break;
			/*
			创建笔触效果对象，参数对象中，可以使用
				.width，线宽，默认为1
				.style，线样式，默认为#000，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
				.join，边角样式，默认为miter尖角，还可以为bevel斜角，round圆角
				.miter，边角宽度，只当join=miter时有效，默认为10
			*/
			case "stroke":
				o.width=para.width && isPos(para.width) ? para.width : 1;
				o.style=para.style ? para.style : '#000';
				o.join=para.join ? para.join : 'miter';
				o.miter=para.miter && isPos(para.miter) ? para.miter : 10;
				o.use=function(){
					p.lineWidth=this.width;
					p.strokeStyle=this.style;
					p.lineJoin=this.join;
					if(this.join=='miter') p.miterLimit=this.miter;
				}
				o.name='stroke';
				break;
			/*
			创建过渡色效果对象，可以应用于各参数对象的style属性，参数对象中，可以使用
				.start，必选，{x:x,y:y}对象或[x,y]数组，过渡的起始点，如果是径向过渡还需要有r值
				.over，必选，{x:x,y:y}对象或[x,y]数组，过渡的终止点，如果是径向过渡还需要有r值
				.stops，必选，Percentages型的对象或数组，过渡的各个色点
				.mode，过渡模式，默认为'linear'线性，还可以为'radial'径向
			*/
			case "gradient":
				if(!isPoint(para.start) || !isPoint(para.over) || !isPers(para.stops))return false;
				
				o.mode=para.mode && para.mode=='radial' ? 'radial' : 'linear';
				o.stops=para.stops;
				o.start=para.start;
				o.over=para.over;
				o.set=function(){
					if(!isPoint(para.start) || !isPoint(para.over))return false;
					var x1=this.start.x,y1=this.start.y,
						x2=this.over.x,y2=this.over.y;
					//径向的起止点要有属性r
					if(this.mode=='radial')
					{
						if(!isPos(this.start.r) || !isPos(this.over.r)) return false;
						else var r1=this.start.r,r2=this.over.r;
						this.p=p.createRadialGradient(x1,y1,r1,x2,y2,r2);
					}
					else this.p=p.createLinearGradient(x1,y1,x2,y2);
					for(var ct in this.stops)
					{
						var sc=this.stops[ct];
						if(isNaN(ct)) ct=float(ct) * 0.01;
						this.p.addColorStop(ct,sc);
					}
				}
				o.get=function(){this.set();return this.p;}
				o.name='gradient';
				o.set();
				break;
			/*
			创建样式对象，可以应用于各参数对象的style属性，参数中
				src，必选，可以是img/媒体/canvas的DOM对象
				repeat，默认为true，如果为false则样式会被拉伸（好像是）
				如果不重复的话，最好不要用小图片
			*/
			case "pattern":
				if(!para.src || !isSource(para.src))return false;
				if(!("repeat" in para)) para.repeat=true;
				o.name='pattern';
				o.src=para.src;
				o.repeat=para.repeat;
				o.set=function(){this.p=p.createPattern(this.src,this.repeat?"repeat":"no-repeat");}
				o.get=function(){this.set();return this.p;}
				break;
		}
		return o;
	}
	/*
	变形系列函数，变形系列函数都是一次一次累积的效果，每次变形都是在上一次的基础上
	scale，放大或缩小，会同时缩放坐标轴（比如原来x=10，放大2倍后，x=10显示出来的样子会像原来的x=20）
	rotate，旋转，使用角度值，以当前的(0,0)坐标为圆心，旋转整个画布
	translate，位移原点，将当前的(0,0)坐标设置到新的位置，移动整个画布
	reset，还原设置，可以使用的参数有
		scaleX,sx		scaleY,sy		scale
		rotate
		translateX,tx	translateY,ty	translate
	在发生形变的时候，程序会记录变化的累积值，在reset时，会将对应的项目退回到0
	*/
	this.scaledX=0;
	this.scaledY=0;
	this.scale=function(x,y){
		p.scale(x,y);
		this.scaledX+=x;
		this.scaledY+=y;
	}
	this.rotated=0;
	this.rotate=function(d){
		p.rotate(d*PI/180);
		this.rotated+=d;
	}
	this.translatedX=0;
	this.translatedY=0;
	this.translate=function(x,y){
		p.translate(x,y);
		this.translatedX+=x;
		this.translatedY+=y;
	}
	this.reset=function(attr){
		if(!isArray(attr)) attr=attr.split(',');
		for(var n=0;n<attr.length;n++)
		{
			switch(attr[n].toLowerCase())
			{
				case "scalex":
				case "sx":
					p.scale(this.scaledX*-1,0);
					this.scaledX=0;
					break;
				case "scaleY":
				case "sy":
					p.scale(0,this.scaledY*-1)
					this.scaledY=0;
					break;
				case "scale":
				case "s":
					p.scale(this.scaledX*-1,this.scaledY*-1);
					this.scaledX=this.scaledY=0;
					break;
				case "rotate":
				case "r":
					p.rotate(this.rotated*PI/-180);
					this.rotated=0;
					break;
				case "translatex":
				case "tx":
					p.translate(this.translatedX*-1,0);
					this.translatedX=0;
					break;
				case "translatey":
				case "ty":
					p.translate(0,this.translatedY*-1);
					this.translatedY=0;
					break;
				case "translate":
				case "t":
					p.translate(this.translatedX*-1,this.translatedY*-1);
					this.translatedX=this.translatedY=0;
					break;
			}
		}
	}
	/*
	测试某个参数是否是可用的source对象
	src，必选，可以是img/媒体/canvas的DOM对象
	*/
	var isSource=function(src){
		var doms='img,video,embed,canvas';
		return src && src.tagName && doms.match(src.tagName.toLowerCase());
	}
	/*
	画图方法，参数对象中，可以使用
		imgX/imgY，图片对象的起始选取坐标，不设置则从(0,0)位置选取
		imgW/imgH，图片对象的选取尺寸，不设置则将整张图片选取
		canX/canY，画布上的起始画图坐标，不设置则从(0,0)位置开画
		canW/canH，画布上的画图尺寸，不设置则将整张图片画出
	*/
	this.paint=function(src,para){
		if(!para)para={};
		if(!isSource(src))return false;
		var imgX=isPos(para.imgX) ? para.imgX : 0,
			imgY=isPos(para.imgY) ? para.imgY : 0,
			imgW=isPos(para.imgW) ? para.imgW : src.width,
			imgH=isPos(para.imgH) ? para.imgH : src.height,
			canX=isPos(para.canX) ? para.canX : 0,
			canY=isPos(para.canY) ? para.canY : 0,
			canW=isPos(para.canW) ? para.canW : src.width,
			canH=isPos(para.canH) ? para.canH : src.height;
		p.drawImage(src,imgX,imgY,imgW,imgH,canX,canY,canW,canH);
	}
	/*
	取图方法，返回像素对象
		start，必选，{x:x,y:y}对象或[x,y]数组，矩形的左上角
		size，必选，{x:x,y:y}对象或[x,y]数组，矩形的尺寸
	返回的对象中，可以使用的成员有
		data[]，像素的信息，每四个元素是一个像素的红/绿/蓝/透明数值
		.reverse()，将像素完全反转，取反色，即255-色值，透明通道不变
		.paint(start)，将像素放置在画布上，参数是{x:x,y:y}对象或[x,y]数组，画布开始画图的坐标，默认为[0,0]
	*/
	this.image=function(start,size){
		if(!isPoint(start) || !isPoint(size))return false;
		var i=p.getImageData(start.x,start.y,size.x,size.y);
		i.reverse=function(){
			for(var n=0;n<this.data.length;n+=4)
			{
				this.data[n]=255-this.data[n];
				this.data[n+1]=255-this.data[n+1];
				this.data[n+2]=255-this.data[n+2];
				//d[n+3]=255;
			}
			return this;
		}
		i.paint=function(start){
			if(!start || !isPoint(start))start={x:0,y:0};
			p.putImageData(this,start.x,start.y);
		}
		return i;
	}
	/*
	清空一个矩形区域，可以将此区域还原成背景色
	如果参数全为空，则将整张画布清空
	*/
	this.clear=function(start,size){
		if(!isPoint(start)) start={x:0,y:0};
		if(!isPoint(size)) size={x:o.width,y:o.height};
		p.clearRect(start.x,start.y,size.x,size.y);
	}
	/*
	计算圆角方法，给出两个端点位置、一个顶点位置、圆角的半径值，三个点必须是不同点
	使用二次贝塞尔曲线画出均匀的圆角
	本函数不直接画圆角，只计算出两个圆角的贝塞尔曲线的起始点/终止点位置，控制点就是角的顶点
	返回一个数组[{x:x1,y:y1},{x:x2,y:y2}]
	*/
	this.calArc=function(a,o,b,r){
		if(
			!isPoint(a) || !isPoint(o) || !isPoint(b)
			|| isSamePoint(a,b) || isSamePoint(a,o) || isSamePoint(o,b)
			|| !isPos(r)
		)return false;
		if(isLine3P(a,o,b)) return [a,b];
		var voa=new CHIvector('temp_v1'),vob=new CHIvector('temp_v2');
		voa.set2P(o,a); vob.set2P(o,b);
		var AOB=acos(voa.inner(vob)/voa.m/vob.m);
		var module=r/tan(AOB/2);
		var uoa=voa.unit,uob=vob.unit;
		var vom=new CHIvector('temp_v11'),von=new CHIvector('temp_v22');
		vom.set(voa.unit); von.set(vob.unit);
		vom.set(vom.times(module)); von.set(von.times(module));
		var m=vom.end(o),n=von.end(o);
		return [m,n];
	}
	/*
	正多边形，给出边数N>=3、中心点cp、外接圆半径R
	参数对象中，可以使用的有
		.radius，三个角共同的弧度圆半径
		.dir，默认为0，顶点朝向（按canvas中的圆的角度，每45度算一格，共0-7八个）
		.angle，默认为0，最大可到360之前的一个数
		当dir与angle都不存在的时候，取0，否则以存在的那个值为准，dir优先
		.shadow，阴影效果对象，默认为无阴影，阴影会优先使用在笔触上，没有笔触则使用在填充上
		.width，线宽，默认为1
		.style，线样式，默认为#000，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern
		.join，边角样式，默认为miter尖角，还可以为bevel斜角，round圆角
		.miter，边角宽度，只当join=miter时有效，默认为10
		.stroke，路径颜色，默认为无路径，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
		.fill，填充颜色，默认为无填充，还可以使用颜色值/颜色名/过渡对象gradient/样式对象pattern/笔触对象stroke
	*/
	var equalPoints=function(N,cp,R,para){
		if(!isPoint(cp) || !isPos(N) || N<3 || !isPos(R))return false;
		if(!para)para={};
		var T=0;
		if("dir" in para) T=para.dir * PI/4;
		else if("angle" in para) T=para.angle * PI/180;
		var ps=[];
		for(var n=0;n<N;n++)
		{
			var u={x:cos(T),y:sin(T)};
			var v=new CHIvector('temp_vector');
			v.set({x:u.x*R,y:u.y*R});
			ps.push(v.end(cp));
			T+=PI*2/N;
		}
		return ps;
	}
	this.isogon=function(N,cp,R,para){
		if(!para)para={};
		var ps=equalPoints(N,cp,R,para);
		if(!ps)return false;
		this.polygon(ps,para);
	}
	//正三角形equilateral triangle
	this.etri=function(cp,R,para){this.isogon(3,cp,R,para);}
	//等腰直角三角形equilateral right triangle，一是使用外接圆半径，二是使用内切圆半径
	this.ert=function(cp,R,para){
		if(!isPoint(cp) || !isPos(R))return false;
		if(!para)para={};
		var T=0;
		if("dir" in para) T=para.dir * PI/4;
		else if("angle" in para) T=para.angle * PI/180;
		var p1,p2,p3
		var ps=[];
		for(var n=0;n<3;n++)
		{
			var u={x:cos(T),y:sin(T)};
			var v=new CHIvector('temp_vector');
			v.set({x:u.x*R,y:u.y*R});
			ps.push(v.end(cp));
			T+=n?PI:PI/2;
		}
		this.polygon(ps,para);
	}
	this.ert2=function(cp,r,para){
		if(!isPoint(cp) || !isPos(r))return false;
		if(!para)para={};
		var T=0;
		if("dir" in para) T=para.dir * PI/4;
		else if("angle" in para) T=para.angle * PI/180;
		var p1,p2,p3
		var ps=[];
		for(var n=0;n<3;n++)
		{//直角顶点的向量模=r*根号2，方向角是基本角；另两向量的模=r/sin(22.5度)，方向角是基本角±PI*5/8
			var module=n ? r/sin(PI/8) : Math.SQRT2*r;
			var u={x:cos(T),y:sin(T)};
			var v=new CHIvector('temp_vector');
			v.set({x:u.x*module,y:u.y*module});
			ps.push(v.end(cp));
			T+=n?PI*3/4:PI*5/8;
		}
		this.polygon(ps,para);
	}
	//正方形
	this.square=function(cp,R,para){this.isogon(4,cp,R,para);}
	/*
	正多边星形，给出边数N>=3、中心点p、外接圆半径R、内切圆半径r
		参数中的RADIUS为外角使用的圆角半径
		参数中的radius为内角使用的圆角半径
	*/
	this.star=function(N,cp,R,r,para){
		if(!isPoint(cp) || !isPos(N) || N<3 || !isPos(r) || !isPos(R))return false;
		if(!para)para={};
		var T=0;
		if("dir" in para) T=para.dir * PI/4;
		else if("angle" in para) T=para.angle * PI/180;
		var D=PI/N;
		var ps=[];
		for(var n=0;n<N;n++)
		{
			var uoa={x:cos(T),y:sin(T)},
				uob={x:cos(T+D),y:sin(T+D)};
			var voa=new CHIvector('temp_v1'),vob=new CHIvector('temp_v2');
			voa.set({x:uoa.x*R,y:uoa.y*R});
			vob.set({x:uob.x*r,y:uob.y*r});
			ps.push(voa.end(cp));
			ps.push(vob.end(cp));
			T+=2*PI/N;
		}
		para.close=true;
		for(var n=0;n<ps.length;n++)
		{
			var P=ps[n];
			if(n%2)//奇数应用小圆角
			{
				if(!P.r && para.radius) P.r=para.radius;
			}
			else//偶数应用大圆角
			{
				if(!P.r && para.RADIUS) P.r=para.RADIUS;
			}
		}
		this.line(ps,para);
	}
	/*
	圆角矩形，para参数对象中，除了矩形可用的样式参数外，还有一项r参数，是圆角半径
	*/
	this.rectr=function(start,size,para){
		if(!isPoint(start) || !isPoint(size))return false;
		if(!para)para={};
		if(!para.r)para.r=0;
		var ps=[];
		var x=start.x,y=start.y,w=size.x,h=size.y,r=para.r;
		ps.push({x:x,y:y,r:r});
		ps.push({x:x,y:y+h,r:r});
		ps.push({x:x+w,y:y+h,r:r});
		ps.push({x:x+w,y:y,r:r});
		para.close=true;
		this.line(ps,para);
	}
	/*
	饼形统计图
		cp，必选，图的中心点坐标
		r，必选，图的半径
		ps，必选，Percentages对象，每个元素的范围及颜色
			此处的ps对象格式不同于gradient的参数是要
			Array[[percentage,color]]或
			Array[{percentage:color}]形式的
	para，参数对象中，可以使用的有
		.from，第一个元素的起始角度，默认为0，可以为0-360之前
	para中的填充或笔触类，都应用在背景圆上，不应用在扇形上
	*/
	this.pie=function(cp,r,ps,para){
		if(!isPoint(cp) || !isPos(r) || !isPers(ps))return false;
		if(!para)para={};
		var T=para.from ? para.from : 0;
		this.circle(cp,r,para);
		for(var n in ps)
		{
			var per,color;
			var p=ps[n];
			if(isArray(p))
			{
				per=p[0];
				color=p[1];
			}
			else
			{
				for(var t in p)
				{
					per=t;
					color=p[t];
				}
			}
			if(isNaN(per)) per=float(per) * 0.01;
			var theta=per * 360;
			this.sector(cp,r,T,T+theta,{fill:color});
			T+=theta;
		}
	}
	/*
	奇数角的有交叉线的星形，只能画奇数的星，取N点，每隔M个画一次，且M不能是N的因数
	函数的计算方式跟isogon完全一样，只是画法不一样
		N，必选，顶点数
		cp，必选，星的中心点坐标
		R，必选，星的外接圆半径
	para，参数对象中，可以使用的有
		.step，默认为2，每隔step个点画一次线，step不能是N的因数
	*/
	this.star2=function(N,cp,R,para){
		if(!para)para={};
		var ps=equalPoints(N,cp,R,para);
		if(!ps)return false;
		var step=para.step ? para.step : 2;
		if(!isPos(step) || step<2 || N%step==0)step=2;
		var l=ps.length;
		var nps=[];
		var cnt=0;
		do
		{
			nps.push(ps[cnt]);
			cnt+=step;
			cnt%=l;
		}while(cnt);
		this.polygon(nps,para);
	}
	/*
	花瓣型，均匀的点，连接点之间的线是弧线，可外凸，可内凹
		R，必选，中心到各顶点的距离（相当于正N边形的外接圆）
		r，必选，各圆弧的半径，最小值 R * sin(PI/N*step)，小于最小值将采用最小值
		当R=r时是一个圆，r越大形状越接近正多边形
	para，参数对象中，可以使用的有
		.step，默认为1，每step个点画一次线
		.opp，默认为false，花心C，圆心O，弦径垂足M，CM与OM是否方向相同；如果M与C重合（当偶数边N=2k使用一半边数k作为步长step时），opp决定的是任意顶点P，CP与OC是否同向
		.out，默认为true，画（正N边形的）外侧的弧，为false则画内侧的弧
		.turn，默认为0，使用角度值，会呈现花的样子，如果有偏移，会呈现不同的样式，可能会有风车、火轮、带直边的花
		.close，默认为false，是否生成闭合的图形
		.outSwap，默认为false，out每次使用都进行一次非运算
	规律
		1.opp=false时，R=r的话始终是圆，无论step或N
		2.在step=1的情况下，out=true，opp=false时，r越大，形状越向内逼近正N边形（由大变小）；而out=false，opp=true时，r越大，形状越向外逼近正N边形（由小变大）
		3.在opp一定时，如果边数l+m=N的话，它们两个分别在out情况不同时，等于对方的图（l边的out=true时的图，等于m边的out=false时的图）
		4.当r<=R，step!=N/2时，由于O与M重合，双图合一，合一的图取决于out的状态，跟opp无关
		5.当r<=R，step=N/2时，四图合一
		6.当r>R，step=N/2时，双图合一，合一的图是out与opp对应相反的图
		7.当r>R，step!=N/2时，四图不同
	*/
	this.flower=function(N,cp,R,r,para){
		if(!para)para={};
		var ps=equalPoints(N*2,cp,R,para);
		if(!ps || !isPos(r))return false;
		var opp=para.opp ? para.opp : false;
		var out="out" in para ? para.out : true;
		var step=para.step && isPos(para.step) ? para.step : 1;
		if(step == N)return false;
		var UNIT=PI/N,
			alpha=UNIT*step,
			beta=asin(R/r*sin(alpha));
		if(!beta)beta=PI*0.5;//精度问题，最小半径计算出来的sin(beta)值可能超过1
		//每两个相邻顶点所在的各小圆o上的角度是一样的
		var start=opp ? (PI/2+beta) : (1.5*PI-beta),
			over=opp ? (PI/2-beta) : (1.5*PI+beta);
		if(step>N/2)
		{
			var t=start,start=over,over=t;
		}
		opp=opp?-1:1;
		//O是任意小圆圆心，M是任意弦的中点
		var mOM=new Number(r * cos(beta)), mCM=new Number(R * cos(alpha));
		mOM=mOM.toFixed(4), mCM=mCM.toFixed(4);
		mOM=Math.round(mOM), mCM=Math.round(mCM);
		var T=0;
		if("dir" in para) T=para.dir * PI/4;
		else if("angle" in para) T=para.angle * PI/180;
		var turn=para.turn ? para.turn : 0;
		var correct=UNIT*step+T+PI/2+turn*PI/180 + (step>N/2 ? PI : 0);
		var move="move" in para ? para.move : true;
		p.beginPath();
		var cnt=0;
		for(var n=0;n<N*2;n+=2)
		{
			var p1=ps[n];
			var p2=ps[(n+step*2)%(N*2)];
			//p1，p2是多边形的角顶点，pt是为了计算用的中间点，M是弦P1P2与CM的交点（垂足）
			var pt=ps[(n+step)%(N*2)];
			var pM={x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2};
			var v=new CHIvector('temp_vector');
			var o,uv;
			if(!mOM) o=pM;//当O与M重合时，不判断opp
			else if(mCM)
			{//当垂足M与中心C分离时，opp决定OM的方向是否与CM相同
				v.set2P(cp,pM);//Vector Cp-M
				uv=v.unit;
				v.set({x:uv.x*mOM*opp,y:uv.y*mOM*opp});//Vector O-M
				o=v.m ? v.start(pM) : cp;//当OM重合，O就是C
			}
			else
			{//当垂足M与中心C重合时，opp决定OC(OM)的方向是否与CP相同，此时mOC=mOM
				v.set2P(cp,pt);//Vector Cp-p
				uv=v.unit;
				v.set({x:uv.x*mOM*opp,y:uv.y*mOM*opp});//Vector O-C
				o=v.start(cp);
			}
			p.moveTo(p1.x,p1.y);
			p.arc(o.x,o.y,r,start+correct,over+correct,!out);
			p.lineTo(p2.x,p2.y);
			correct+=UNIT*2 //+ PI;
			cnt++;
		}
		draw(para);
	}
	/*移动到点a*/
	this.M=this.moveTo=function(a){
		if(!isPoint(a))return false;
		p.moveTo(a.x,a.y);
	}
	/*
	构造一段直线，不直接画线，需要配合其它动作
	由当前点直接向a点画一条线段
	*/
	this.L=this.lineTo=function(a){
		if(!isPoint(a))return false;
		p.lineTo(a.x,a.y);
	}
	/*
	构造一段路径，不直接画线，需要配合其它动作
	用二次贝塞尔曲线，在点a，o，b之间画一段圆弧
	*/
	this.arcTo=function(a,o,b){
		if(
			!isPoint(a) || !isPoint(o) || !isPoint(b)
			|| isSamePoint(a,b) || isSamePoint(a,o) || isSamePoint(o,b)
		)return false;
		p.moveTo(a.x,a.y);
		p.quadraticCurveTo(o.x,o.y,b.x,b.y);
	}
	/*
	二次贝塞尔曲线，与canvas原义相同
	*/
	this.Q=this.quadraticCurveTo=function(x1,y1,x2,y2){
		p.quadraticCurveTo(x1,y1,x2,y2);
	}
	//开始/关闭路径
	this.beginPath=function(){p.beginPath();}
	this.closePath=function(){p.closePath();}
	this.stroke=function(){p.stroke();}
	this.fill=function(){p.fill();}
	//保存及恢复画布属性
	this.save=function(){p.save();}
	this.restore=function(){p.restore();}
	//调整画图的透明度
	this.alpha=function(n){
		if(isNaN(n) || n<0 || n>1)n=1;
		p.globalAlpha=n;
	}
	/*
	调整画图模式，可以使用系统值，也可以使用新定义的值
	三个数字的意思：不留为0，第一位留为-1，第三位留为1，第二位留原图为-1，新图为1
	source-over，		cover，		"-111"，		默认值，新图覆盖在原图之上
	destination-over，	under，		"-1-11"，	新图在原图之下
	source-atop，		drop，		"-110"，		新图的重合的部分，在原图之上，余处消失（像新图掉落在原图上一样，重合的部分被托住，放在上边，没重合的部分继续掉落不见）
	destination-atop，	lift，		"0-11"，		原图的重合的部分，在新图之上，余处消失（像新图从下托起原图一样，重合的部分被托住，放在上边，没重合的部分消失不见）
	source-in，			clipped，	"010"，		新图的重合的部分留下，其它全都消失（新图被原图剪裁，留下被剪裁的部分）
	destination-in，		clip，		"0-10"，		原图重合的部分留下，其它全都消失（用新图剪裁原图，留下剪裁出来的部分）
	source-out，			erased，		"001"，		新图在原图之外的部分留下，其它全都消失（新图被原图抹去一部分，留下没被抹掉的）
	destination-out，	erase，		"-100"，		原图在新图之外的部分留下，其它全都消失（新图抹掉了原图的一部分，留下没被抹掉的）
	lighter，			mix，		"2"，		新图与原图重合的部分色彩融合，其它部分正常显示
	copy，							"011"，		忽略原图，只留新图
	xor，							"-101"，		重合的部分消失不见，只留不重合的部分
	*/
	this.mode=function(n){
		switch(n)
		{
			case "source-over":
			case "-111":
			case "cover": n="source-over"; break;
			case "destination-over":
			case "-1-11":
			case "under": n="destination-over"; break;
			case "source-atop":
			case "-110":
			case "drop": n="source-atop"; break;
			case "destination-atop":
			case "0-11":
			case "lift": n="destination-atop"; break;
			case "source-in":
			case "010":
			case "clipped": n="source-in"; break;
			case "destination-in":
			case "0-10":
			case "clip": n="destination-in"; break;
			case "source-out":
			case "001":
			case "erased": n="source-out"; break;
			case "destination-out":
			case "-100":
			case "erase": n="destination-out"; break;
			case "lighter":
			case "mix":
			case "2": n="lighter"; break;
			case "copy":
			case "011": n="copy"; break;
			case "xor":
			case "-101": n="xor"; break;
			default: n="source-over";
		}
		p.globalCompositeOperation=n;
	}
	/*
	本类未使用canvas命令
	clip
	transform
	isPointInPath
	bezierCurveTo
	createImageData
	*/
}
