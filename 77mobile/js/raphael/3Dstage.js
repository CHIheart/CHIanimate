/*
基于Raphael及JQuery写的3D舞台框架，目前只处理点、折线、凸多边形、凸多面体
使用方法：
var stage=CHI3Dstage(DOMid,options);
options为配置参数集合对象，可以使用的属性有
	perspective，一点透视的灭点
	skewxy，斜轴测投影的横向错切量
	skewzy，斜轴测投影的纵向错切量
	centerx，centery，坐标系原点相对于容器内容区左上角的位置，可以使用百分量或像素值
生成舞台实例后，可生成全局方法
	isPoint()，返回对象是否是数据点对象
	isDot()，返回对象是否是模型点对象
生成舞台实例后，扩展了Raphael
	扩展了自定义属性paper.ca
		point:[x,y,z]，模型点对象使用，点的三维坐标
	扩展了元素及集合方法Raphael.el/Raphael.st
		.center()，返回图形的几何中心（各点坐标求平均数，折线、多边形、多面体使用）
		.nodes()，返回图形具有的端点数（折线、多边形、多面体使用）
		.transform...，转换系列函数（不一一列举）
		.fadeIn(duration,easing,callback)，淡入效果
		.fadeOut(duration,easing,callback)，淡出效果
		.on(eventname,handler)，绑定事件
		.off(eventname[,handler])，解绑事件
		在on和off中，可使用的事件名称有
			transform，图形发生转换时，执行了transform系列函数
			show，图形显示时，执行了show或fadeIn
			hide，图形隐藏时，执行了hide或fadeOut
			remove，图形被移除时，执行了remove
		.reference(x,y,z)，改变形状的转换参照点
	一些附加的不开放data数据
		__model:""，各个舞台图形的类型名称
		__reference_point:[]，转换参照点坐标
		__points:[[x,y,z]]，折线、多边形、多面体使用，组成图形的有序点阵
		__hedron:Raphael.set，拼合型多面体的面使用，指向所属的多面体
	重写了元素及集合方法Raphael.el/Raphael.st
		.remove()，移除元素的同时，执行remove事件处理函数
		.show()，显示元素的同时，执行show事件处理函数
		.hide()，隐藏元素的同时，执行hide事件处理函数
		
		
生成的舞台对象，包含的成员有
	.attr(attr,value)	设置或返回舞台的配置参数
	.refresh()			刷新整个舞台
	.shapes{			图形集合对象
		dots:[],		点对象数组
		polylines:[],	折线对象数组
		polygons:[],	多边形对象数组
		polytopes:[],	多面体对象数组
	}
	.clear()			删除所有对象
	.set(...)			生成一个Raphael集合

用于构造图形的方法有
stage.point(x,y,z)或.point(dot)或.point(point)
	生成一个数据点对象，此对象可以使用的方法有
		.project()		重新计算投影坐标
		.position()		返回三维坐标数组
		.projection()	返回二维坐标数组
		.clone()		复制一个数据点对象
		.transform()	转换系列函数（不一一列举）
*/
function CHI3Dstage(id,setOptions)
{
	if(!setOptions) setOptions={};
	var DOM=$("#"+id),
		width=DOM.width(),
		height=DOM.height(),
		GlobalPerspective="perspective" in setOptions ? setOptions.perspective : -.002,
		GlobalSkewXY="skewxy" in setOptions ? setOptions.skewxy : -.354,
		GlobalSkewZY="skewzy" in setOptions ? setOptions.skewzy : .354,
		CenterX="centerx" in setOptions ? setOptions.CenterX : '50%',
		CenterY="centery" in setOptions ? setOptions.CenterY : '50%',
		paper=Raphael(id,width,height),
		prefix=arguments.callee.name,
		names={
			dot:prefix+'.DOT',
			polyline:prefix+'.POLYLINE',
			polygon:prefix+'.POLYGON',
			polytope:prefix+'.POLYTOPE',
			polyhedron:prefix+'.POLYHEDRON',
			events:prefix+'.EVENTS'
		},
		//目前支持的自定义事件名称数组，有别于Raphael或JQuery的事件
		eventNames='transform,remove,hide,show'.split(',');
	$.isArguments=function(o){return o && o.callee;}
	//生成全局paper
	if(setOptions.paper) window.paper=paper;
	var stage={};
	//paper.circle(0,0,5).attr({fill:'yellow',stroke:'red','stroke-width':2});
	/*
	设置或返回画布属性，可以使用的参数格式有
	1. attr,value，属性及值，返回对象本身，可以使用的属性有
		centerx,centery，画布的中心位置（相对于DOM内容盒左上角），可以使用百分量或像素值
		perspective，投影的透视灭点，一般为-1~0之间的小数
		skewxy,skewZY，斜轴测投影的错切量
	2. attr，属性名，返回属性值
	3. 空，返回设置集合对象
	4. 键值对集合，批量设置合法的属性
	*/
	stage.attr=function(){
		var arg=arguments,
			bChangedCenter=false,
			bChangedProject=false,
			len=arg.length
		;
		switch(arg.length)
		{
			case 0:
				return {
					centerX:CenterX,
					centerY:CenterY,
					perspective:GlobalPerspective,
					skewXY:GlobalSkewXY,
					skewZY:GlobalSkewZY
				};
				break;
			case 1:
				if($.isPlainObject(arg[0]))//使用键值对批量设置
				{
					arg=arg[0];
					for(var n in arg)
					{
						switch(n.toLowerCase())
						{
							case "centerx":
								CenterX=arg[n];
								bChangedCenter=true;
								break;
							case "centery":
								CenterY=arg[n];
								bChangedCenter=true;
								break;
							case "perspective":
								GlobalPerspective=arg[n];
								bChangedProject=true;
								break;
							case "skewxy":
								GlobalSkewXY=arg[n];
								bChangedProject=true;
								break;
							case "skewzy":
								GlobalSkewZY=arg[n];
								bChangedProject=true;
								break;
							default:;//错误的属性被忽略
						}
					}
				}
				else if(arg[0].toLowerCase)//返回一个属性值
				{
					var result=false;
					switch(arg[0].toLowerCase())
					{
						case "centerx":
							result=CenterX;
							break;
						case "centery":
							result=CenterY;
							break;
						case "perspective":
							result=GlobalPerspective;
							break;
						case "skewxy":
							result=GlobalSkewXY;
							break;
						case "skewzy":
							result=GlobalSkewZY;
							break;
					}
					return result;
				}
				else return false;
				break;
			case 2://使用键，值设置
				if(!arg[0].toLowerCase) return false;
				switch(arg[0].toLowerCase())
				{
					case "centerx":
						CenterX=arg[1];
						bChangedCenter=true;
						break;
					case "centery":
						CenterY=arg[1];
						bChangedCenter=true;
						break;
					case "perspective":
						GlobalPerspective=arg[1];
						bChangedProject=true;
						break;
					case "skewxy":
						GlobalSkewXY=arg[1];
						bChangedProject=true;
						break;
					case "skewzy":
						GlobalSkewZY=arg[1];
						bChangedProject=true;
						break;
					default:return false;
				}
				break;
			default: return false;
		}
		if(bChangedCenter) setOriginal();
		if(bChangedProject) setProjective();
		return this;
	}
	//更改画布中心
	function setOriginal(){
		!reg_pixel.test(CenterX) && !reg_percentage.test(CenterX) && (CenterX="50%");
		!reg_pixel.test(CenterY) && !reg_percentage.test(CenterY) && (CenterY="50%");
		var x=reg_pixel.test(CenterX) ? CenterX : width * CenterX.replace('\%','') /100,
			y=reg_pixel.test(CenterY) ? CenterY : height * CenterY.replace('\%','') /100;
		paper.setViewBox(-x,-y,width,height);
	}
	setOriginal();
	//更改画布投影参数
	function setProjective(){
		!reg_float.test(GlobalPerspective) && (GlobalPerspective=-.002);
		!reg_float.test(GlobalSkewXY) && (GlobalSkewXY=-.354);
		!reg_float.test(GlobalSkewZY) && (GlobalSkewZY=.354);
		stage.refresh();
	}
	//画布全体刷新，消耗很大
	stage.refresh=function(){
		for(var n in this.shapes)
			this.shapes[n].forEach(function(ele,ind){
				ele.refresh();
			});
		return this;
	}
	//图形集合对象
	stage.shapes={
		points:[],//数据点集合
		dots:paper.set(),//图形点集合
		polylines:paper.set(),//折线集合
		polygons:paper.set(),//多边形集合
		polytopes:paper.set()//多面体集合
	};
	//生成一个Raphael集合
	stage.set=function(){
		var set=paper.set();
		for(var n=0;n<arguments.length;n++) set.push(arguments[n]);
		return set;
	}
	//清空舞台
	stage.clear=function(){
		for(var n in shapes) $.isArray(shapes[n]) && (shapes[n]=null,shapes=[],true) || shapes[n].clear();
		paper.clear();
		return this;
	}
	///////////////////////////////////////////////////////////////////数据点
	/*
	构造数据点，可以使用的参数形式有
	1.三个数字作为坐标
	2.有三个数字元素的数组
	3.另一个数据点对象
	4.一个模型点对象
	point对象的五个坐标属性（都带有下划线的）被视为私有属性，不要在stage函数外部访问
	*/
	function point()
	{
		var arg=arguments;
		switch(arg.length)
		{
			case 1://一点构造或数组构造
				arg=arg[0];
				var bd;
				if(!isPoint(arg) || !(bd=isDot(arg))) return false;
				bd && (arg=arg.attr('point'));
				break;
			case 3: break;
			default: return false;
		}
		this[0]=arg[0];
		this[1]=arg[1];
		this[2]=arg[2];
		this.project();
	}
	var pointProto=point.prototype;
	function project(){
		var ratio=this[1] * GlobalPerspective + 1;
		this.x=(this[0] + GlobalSkewXY * this[1]) / ratio;
		this.y=(GlobalSkewZY * this[1] - this[2]) / ratio;
		return this;
	}
	pointProto.project=project;
	pointProto.projection=function(){return [this.x,this.y];}
	pointProto.position=function(){return [this[0],this[1],this[2]];}
	pointProto.clone=function(){return new point(this[0],this[1],this[2]);}
	/*
	平移，三参必需
	可以由外部调用
	*/
	function translate3D(x,y,z){
		this[0]+=x;
		this[1]+=y;
		this[2]+=z;
		return project.call(this);
	}
	function translateX(x){return translate3D.apply(this,[x,0,0]);}
	function translateY(y){return translate3D.apply(this,[0,y,0]);}
	function translateZ(z){return translate3D.apply(this,[0,0,z]);}
	pointProto.translate3D=translate3D;
	pointProto.translateX=translateX;
	pointProto.translateY=translateY;
	pointProto.translateZ=translateZ;
	/*
	缩放/拉伸
	可以由外部调用，可以使用的参数形式有
	1. scaleAll
	2. scaleX,scaleY,scaleZ
	3. scaleAll,Point
	4. scaleX,scaleY,scaleZ,Point
	5. scaleX,scaleY,scaleZ,px,py,pz
	6. Point,scaleAll
	7. Point,scaleX,scaleY,scaleZ
	*/
	function scale3D(){
		var arg=arguments,sx,sy,sz,px,py,pz;
		switch(arg.length)
		{
			case 1://scaleAll
				if(isNaN(arg[0])) return false;
				sx=sy=sz=arg[0];
				px=py=pz=0;
				break;
			case 2://(scaleAll,Point)或(Point,scaleAll)
				var p,scale,p1,p2,d1,d2;
				if(
					!(p1=isPoint(arg[0])) && !(d1=isDot(arg[0]))
					&& !(p2=isPoint(arg[1])) && !(d2=isDot(arg[1]))
				) return false;
				(p1 || d1) && (p=arg[0],scale=arg[1],true) || (p=arg[1],scale=arg[0]);
				if(isNaN(scale)) return false;
				(d1 || d2) && (p=p.attr('point'));
				px=p[0];
				py=p[1];
				pz=p[2];
				p=null;
				sx=sy=sz=scale;
				break;
			case 3://scaleX,scaleY,scaleZ
				if(isNaN(arg[0]) || isNaN(arg[1]) || isNaN(arg[2])) return false;
				px=py=pz=0;
				sx=arg[0];
				sy=arg[1];
				sz=arg[2];
				break;
			case 4://(scaleX,scaleY,scaleZ,Point)或(Point,scaleX,scaleY,scaleZ)
				var p,index,p1,p2,d1,d2;
				if(
					!(p1=isPoint(arg[0])) && !(d1=isDot(arg[0]))
					&& !(p2=isPoint(arg[3])) && !(d2=isDot(arg[3]))
				) return false;
				(p1 || d1) && (p=arg[0],scale=arg[1],index=1,true) || (p=arg[3],scale=arg[0],index=0);
				sx=arg[index];
				sy=arg[index+1];
				sz=arg[index+2];
				if(isNaN(sx) || isNaN(sy) || isNaN(sz)) return false;
				(d1 || d2) && (p=p.attr('point'));
				px=p[0];
				py=p[1];
				pz=p[2];
				p=null; 
				break;
			case 6://(scaleX,scaleY,scaleZ,px,py,pz)
				for(var n=0;n<arg.length;n++) if(isNaN(arg[n])) return false;
				sx=arg[0]; sy=arg[1]; sz=arg[2];
				px=arg[3]; py=arg[4]; pz=arg[5];
				break;
		}
		this[0]=this[0]*sx+(1-sx)*px;
		this[1]=this[1]*sy+(1-sy)*py;
		this[2]=this[2]*sz+(1-sz)*pz;
		return project.call(this);
	}
	pointProto.scale3D=scale3D;
	//查找单一缩放/旋转命令中的参数列表中，缩放/旋转量的位置
	function amountIndex(args){
		switch(args.length)
		{
			case 1:
			case 4:
			case 5:
				return 0;
			case 2:
				return isPoint(args[0]) ? 1:0;
		}
		return -1;
	}
	/*
	单一方向上的缩放/拉伸
	可以使用的参数形式有
	1. scale
	2. scale,Point
	3. scale,px,py,pz
	4. Point,scale
	*/
	function scaleX(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		Array.prototype.splice.call(arguments,index+1,0,1,1);
		return scale3D.apply(this,arguments);
	}
	pointProto.scaleX=scaleX;
	function scaleY(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		Array.prototype.splice.call(arguments,index+1,0,1);
		Array.prototype.splice.call(arguments,index,0,1);
		return scale3D.apply(this,arguments);
	}
	pointProto.scaleY=scaleY;
	function scaleZ(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		Array.prototype.splice.call(arguments,index,0,1,1);
		return scale3D.apply(this,arguments);
	}
	pointProto.scaleZ=scaleZ;
	//坐标轴及坐标平面翻转，可接受一个参照点作为参数
	pointProto.flipX=function(){return scale3D.call(this,1,-1,-1,arguments[0]);}
	pointProto.flipY=function(){return scale3D.call(this,-1,1,-1,arguments[0]);}
	pointProto.flipZ=function(){return scale3D.call(this,-1,-1,1,arguments[0]);}
	pointProto.flipXY=function(){return scale3D.call(this,1,1,-1,arguments[0]);}
	pointProto.flipXZ=function(){return scale3D.call(this,1,-1,1,arguments[0]);}
	pointProto.flipYZ=function(){return scale3D.call(this,-1,1,1,arguments[0]);}
	//坐标平面投影
	pointProto.projectXY=function(){return scale3D.call(this,1,1,0,arguments[0]);}
	pointProto.projectXZ=function(){return scale3D.call(this,1,0,1,arguments[0]);}
	pointProto.projectYZ=function(){return scale3D.call(this,0,1,1,arguments[0]);}
	/*
	坐标轴旋转，前三个参数是旋转轴的方向向量，第四参数是旋转角，后三参数为参照点坐标，也可只使用一个（数据/模型）点对象或点数组
	rotateX/Y/Z（扩展方法）可以使用的参数形式有
	1. degree,Point
	2. degree,px,py,pz
	3. Point,degree
	*/
	function rotate3D(vx,vy,vz,degree,px,py,pz){
		var bd,bp;
		if(
			isNaN(vx) || isNaN(vy) || isNaN(vz) || isNaN(degree)//前四个参数必须是数字
			|| (!(bp=isPoint(px)) && !(bd=isDot(px)) && (isNaN(px) || isNaN(py) || isNaN(pz))) //第五参数要么为点，要么为数字且有第六七参数
		)return false;
		if(!degree) return this;
		bd && (px=px.attr('point'),bp=true);
		bp && (py=px[1],pz=px[2],px=px[0]);
		var m=module(vx,vy,vz);
		vx/=m; vy/=m; vz/=m;
		var a=vx,b=vy,c=vz,a2=a*a,b2=b*b,c2=c*c,
			ab=a*b,bc=b*c,ac=a*c,theta=a2t(degree),
			st=sin(theta),ct=cos(theta);
		m=[
			a2 + ct*(1-a2) + 0,
			ab + ct*(-ab)  + st*c, //4
			ac + ct*(-ac)  - st*b, //7
			ab + ct*(-ab)  - st*c, //2
			b2 + ct*(1-b2) + 0,
			bc + ct*(-bc)  + st*a, //8
			ac + ct*(-ac)  + st*b, //3
			bc + ct*(-bc)  - st*a, //6
			c2 + ct*(1-c2) + 0
		];
		
		this[0]-=px;
		this[1]-=py;
		this[2]-=pz;
		var x=this[0],y=this[1],z=this[2];
		this[0]=x*m[0]+y*m[3]+z*m[6];
		this[1]=x*m[1]+y*m[4]+z*m[7];
		this[2]=x*m[2]+y*m[5]+z*m[8];
		this[0]+=px;
		this[1]+=py;
		this[2]+=pz;
		return project.call(this);
	}
	pointProto.rotate3D=rotate3D;
	function rotateX(){
		var arg=arguments,
			index=amountIndex(arg);
		if(index===false) return false;
		var degree=arg[index];
		Array.prototype.splice.call(arg,index,1);
		Array.prototype.unshift.call(arg,1,0,0,degree);
		return rotate3D.apply(this,arg);
	}
	pointProto.rotateX=rotateX;
	function rotateY(){
		var arg=arguments,
			index=amountIndex(arg);
		if(index===false) return false;
		var degree=arg[index];
		Array.prototype.splice.call(arg,index,1);
		Array.prototype.unshift.call(arg,0,1,0,degree);
		return rotate3D.apply(this,arg);
	}
	pointProto.rotateY=rotateY;
	function rotateZ(){
		var arg=arguments,
			index=amountIndex(arg);
		if(index===false) return false;
		var degree=arg[index];
		Array.prototype.splice.call(arg,index,1);
		Array.prototype.unshift.call(arg,0,0,1,degree);
		return rotate3D.apply(this,arg);
	}
	pointProto.rotateZ=rotateZ;
	/*
	错切，可以使用的参数形式有
	本函数禁止外来调用，只能使用skewOO（扩展方法）
	扩展方法可以使用的参数形式有
	1. skew,Point
	2. skew,px,py,pz
	3. Point,skew
	*/
	function skew3D(){
		var caller=skew3D.caller;
		if(caller!=skewXY && caller!=skewXZ && caller!=skewYX && caller!=skewYZ && caller!=skewZX && caller!=skewZY)return false;
		var xy=0,xz=0,yx=0,yz=0,zx=0,zy=0,px=0,py=0,pz=0,
			arg=arguments,skews;
		switch(arg.length)
		{
			case 1://只有错切的键值对
				if(!$.isPlainObject(arg[0])) return false;
				skews=arg[0];
				break;
			case 2://错切集合及一点对象
				var p,p1,p2,d1,d2;
				if(
					!(p1=isPoint(arg[0])) && !(d1=isDot(arg[0]))
					&& !(p2=isPoint(arg[1])) && !(d2=isDot(arg[1]))
				) return false;
				(p1 || d1) && (skews=arg[1],p=arg[0]) || (p2 || d2) && (skews=arg[0],p=arg[1]);
				(d1 || d2) && (p=p.attr('point'));
				px=p[0];
				py=p[1];
				pz=p[2];
				p=null;
				break;
			case 4://错切集合及点的三个坐标
				skews=arg[0];
				px=arg[1];
				py=arg[2];
				pz=arg[3];
				break;
			default:return false;
		}
		outer: for(var n in skews)
		{//一次只有一个错切，所以找到后直接跳出循环
			switch(n)
			{
				case "xy": xy=skews[n]; break outer;
				case "xz": xz=skews[n]; break outer;
				case "yx": yx=skews[n]; break outer;
				case "yz": yz=skews[n]; break outer;
				case "zx": zx=skews[n]; break outer;
				case "zy": zy=skews[n]; break outer;
			}
		}
		//下边的坐标算法是基于每次只有一种错切行为的快捷运算，如果多重错切要修改
		var x=this[0],
			y=this[1],
			z=this[2];
		this[0]+=(y-py)*xy + (z-pz)*xz;
		this[1]+=(x-px)*yx + (z-pz)*yz;
		this[2]+=(x-px)*zx + (y-py)*zy;
		return project.call(this);
	}
	function skewXY(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={xy:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewXY=function(){return skewXY.apply(this,arguments);}
	function skewXZ(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={xz:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewXZ=function(){return skewXZ.apply(this,arguments);}
	function skewYX(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={yx:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewYX=function(){return skewYX.apply(this,arguments);}
	function skewYZ(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={yz:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewYZ=function(){return skewYZ.apply(this,arguments);}
	function skewZX(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={zx:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewZX=function(){return skewZX.apply(this,arguments);}
	function skewZY(){
		var index=amountIndex(arguments);
		if(index===false) return false;
		var skew=arguments[index];
		arguments[index]={zy:skew};
		return skew3D.apply(this,arguments);
	}
	pointProto.skewZY=function(){return skewZY.apply(this,arguments);}
	//是否为point类的实例或一个三维坐标点
	isPoint=function(o){return o && !isNaN(o[0]) && !isNaN(o[1]) && !isNaN(o[2]);}
	stage.point=function(){
		var POINT=new point();
		point.apply(POINT,arguments);
		this.shapes.points.push(POINT);
		return POINT;
	}
	///////////////////////////////////////////////////////////////////////数据点
	var R_el=Raphael.el,R_ca=paper.ca,R_fn=Raphael.fn,R_st=Raphael.st;
	/*
	设置元素的参照点，除了平移之外的转换会根据参照点不同而显现成不同的结果
	可以使用的参数形式有
	1. 三个数字，作为xyz坐标
	2. 一个point对象
	3. 一个dot对象
	4. 关键字center（只对于折线/多边形/多面体有效）
	*/
	R_el.reference=function(){
		var arg=arguments,len=arg.length,ref,error;
		if(len!=1 && len!=3)return false;
		len==1 && (
			arg=arg[0],
			isPoint(arg) && (ref=arg,true)
			|| isDot(arg) && (ref=arg.attr('point'),true)
			|| /center/i.test(arg) && (ref=this.center(),true)
			|| (error=true)
		) ||
		(ref=[arg[0],arg[1],arg[2]]);
		return error ? false : this.data('__reference_point',ref);
	}
	R_st.reference=function(){return RaphaelSetIterate(this,"reference",arguments);}
	/*
	通用转换处理过程，只处理固定几项基础的单参数转换
	如translate3D，scale3D都使用基础转换结合
	此系列的3D转换是绝对量，由图形原始值计算
	*/
	var basicTransformations='translateX,translateY,translateZ,rotate3D,rotateX,rotateY,rotateZ,scaleX,scaleY,scaleZ,skewXY,skewXZ,skewYX,skewYZ,skewZX,skewZY'.split(',');
	function transform3D(attr,value){
		var ba;
		if(transform3D.caller.name in R_ca || $.inArray(attr,basicTransformations)==-1 || isNaN(value) && !(ba=$.isArray(value))) return false;
		var reference=this.data('__reference_point'),
			fun=eval(attr),closed=false,hedron=false;
		ba && (value.push(reference),true) || (value=[value,reference]);
		switch(this.data('__model'))
		{
			case names.dot:
				var xyz=this.attr('point');
				xyz=[xyz[0],xyz[1],xyz[2]];
				fun.apply(xyz,value);
				this.attr('point',[xyz[0],xyz[1],xyz[2]]);
				xyz=null;
				break;
			case names.polyhedron:
				hedron=true;
			case names.polygon:
				closed=true;
			case names.polyline:
				var path=[],points=this.data('__points');
				for(var n=0;n<points.length;n++)
				{
					var xyz=[points[n][0],points[n][1],points[n][2]];
					fun.apply(xyz,value);
					project.call(xyz);
					points[n]=[xyz[0],xyz[1],xyz[2]];
					path.push(fix(xyz.x)+','+fix(xyz.y));
					xyz=null;
				}
				path=path.join('L');
				this.attr('path','M'+path+(closed?'Z':''));
				//拼合多面体需要计算面的可见性
				hedron && 
				(
					sideVisible(
						this.data('__hedron').center(),
						this.center(),
						points[0],
						points[1],
						points[2]
					) && (this.show(),true)
					|| this.hide()
				);
				path=points=null;
				break;
			case names.polytope:
				var points=this.data('__points'),
					ps=points.length,
					sides=this.data('__sides').split(';'),
					ss=sides.length,
					CX=0,CY=0,CZ=0,PATH=[];
				for(var n=0;n<ps;n++)
				{
					var p=points[n];
					p=[p[0],p[1],p[2]];
					fun.apply(p,value);
					points[n][0]=p[0];
					points[n][1]=p[1];
					points[n][2]=p[2];
					CX+=p[0];
					CY+=p[1];
					CZ+=p[2];
					p=null;
				}
				CX/=ps;
				CY/=ps;
				CZ/=ps;

				for(var n=0;n<ss;n++)
				{
					var pts=sides[n].split(','),
						path=[],
						cx=0,cy=0,cz=0;
					ps=pts.length;
					for(var m=0;m<ps;m++)
					{
						var p=points[pts[m]-1];
						p=[p[0],p[1],p[2]];
						project.call(p);
						cx+=p[0];
						cy+=p[1];
						cz+=p[2];
						path.push(fix(p.x)+','+fix(p.y));
						p=null;
					}
					cx/=ps;
					cy/=ps;
					cz/=ps;
					path='M'+path.join('L')+'Z';
					sideVisible([CX,CY,CZ],[cx,cy,cz],points[pts[0]-1],points[pts[1]-1],points[pts[2]-1]) && PATH.push(path);
					pts=null;
				}
				this.attr('path',PATH.join(''));
				break;
			default:;
		}
		return this;
	}
	R_ca.translateX=function(x){return transform3D.call(this,'translateX',x-this.attr('translateX'));}
	R_ca.translateY=function(y){return transform3D.call(this,'translateY',y-this.attr('translateY'));}
	R_ca.translateZ=function(z){return transform3D.call(this,'translateZ',z-this.attr('translateZ'));}
	R_ca.rotate3D=function(x,y,z,degree){
		if(!x && !y && !z && !degree) return this;
		var array=this.attr('rotate3D');
		return transform3D.call(this,'rotate3D',[
			x-array[0],
			y-array[1],
			z-array[2],
			degree-array[3]
		]);
	}
	R_ca.rotateX=function(d){return transform3D.call(this,'rotateX',d-this.attr('rotateX'));}
	R_ca.rotateY=function(d){return transform3D.call(this,'rotateY',d-this.attr('rotateY'));}
	R_ca.rotateZ=function(d){return transform3D.call(this,'rotateZ',d-this.attr('rotateZ'));}
	//最大的缺陷就是scale参数如果曾经为0的话，就没办法再找回原始值了，所以要使用0的话，就使用0.001，不会影响效果，但会使计算正常
	R_ca.scaleX=function(x){return transform3D.call(this,'scaleX',x/this.attr('scaleX'));}
	R_ca.scaleY=function(y){return transform3D.call(this,'scaleY',y/this.attr('scaleY'));}
	R_ca.scaleZ=function(z){return transform3D.call(this,'scaleZ',z/this.attr('scaleZ'));}
	R_ca.skewXY=function(s){return transform3D.call(this,'skewXY',s-this.attr('skewXY'));}
	R_ca.skewXZ=function(s){return transform3D.call(this,'skewXZ',s-this.attr('skewXZ'));}
	R_ca.skewYX=function(s){return transform3D.call(this,'skewYX',s-this.attr('skewYX'));}
	R_ca.skewYZ=function(s){return transform3D.call(this,'skewYZ',s-this.attr('skewYZ'));}
	R_ca.skewZX=function(s){return transform3D.call(this,'skewZX',s-this.attr('skewZX'));}
	R_ca.skewZY=function(s){return transform3D.call(this,'skewZY',s-this.attr('skewZY'));}
	/*
	3D转换方法，可以当作attr使用也可以当作animate使用，就看有没有duration，attr的话会忽略easing及callback
	每个可外部调用的转换方法，第一参数必须遵守
		1. 使用单向平移translate/拉伸scale/错切skew/旋转rotate时，第一参数必须是一个数字
		2. 使用三向平移translate3D/拉伸scale3D时，第一参数必须是一个有3个元素的数字数组
		3. 使用镜射flip和投影project时，不需要第一参数
		4. rotate3D，skew3D，在数学意义上是不可以外部调用的，transform3D暂时不开放（以后可能会开放matrix转换）
	后边的参数可以随意放置，可用的参数有
		point，转换的参照点，除了平移translate之外都有效
		duration，动画的执行时间（如果为0则会是attr的效果，否则为animate的效果）
		easing，动画的舒缓函数（duration=0时被忽略）
		callback，动画完成的回调函数（duration=0时被忽略）
	*/
	//translate3D的第一参要使用一个拥有3个数字元素的数组
	R_el.translate3D=function(xyz,duration,easing,callback){
		if(!$.isArray(xyz) || xyz.length<3) return false;
		return this.animate({
			translateX:xyz[0],
			translateY:xyz[1],
			translateZ:xyz[2]
		},duration,easing,callback);
	}
	R_el.translateX=function(x,duration,easing,callback){
		if(isNaN(x)) return false;
		return this.animate({translateX:x},duration,easing,callback);
	}
	R_el.translateY=function(y,duration,easing,callback){
		if(isNaN(y)) return false;
		return this.animate({translateY:y},duration,easing,callback);
	}
	R_el.translateZ=function(z,duration,easing,callback){
		if(isNaN(z)) return false;
		return this.animate({translateZ:z},duration,easing,callback);
	}
	//scale3D的第一参要使用一个数字（整体放大）或一个拥有3个数字元素的数组
	R_el.scale3D=function(amount,duration,easing,callback,referencePoint){
		if(!$.isArray(amount) && isNaN(amount))return false;
		var sx,sy,sz;
		!isNaN(amount) && (sx=sy=sz=amount,true) || (sx=amount[0],sy=amount[1],sz=amount[2]);
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({
			scaleX:sx,
			scaleY:sy,
			scaleZ:sz
		},duration,easing,callback);
	}
	R_el.scaleX=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleX:amount},duration,easing,callback);
	}
	R_el.scaleY=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleY:amount},duration,easing,callback);
	}
	R_el.scaleZ=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleZ:amount},duration,easing,callback);
	}
	R_el.flipX=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleY:-1,scaleZ:-1},duration,easing,callback);
	}
	R_el.flipY=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleX:-1,scaleZ:-1},duration,easing,callback);
	}
	R_el.flipZ=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleY:-1,scaleX:-1},duration,easing,callback);
	}
	R_el.flipXY=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleZ:-1},duration,easing,callback);
	}
	R_el.flipYZ=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleX:-1},duration,easing,callback);
	}
	R_el.flipXZ=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleY:-1},duration,easing,callback);
	}
	R_el.projectXY=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleZ:.001},duration,easing,callback);
	}
	R_el.projectXZ=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleY:.001},duration,easing,callback);
	}
	R_el.projectYZ=function(duration,easing,callback,referencePoint){
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({scaleX:.001},duration,easing,callback);
	}
	R_el.rotate3D=function(xyzd,duration,easing,callback,referencePoint){
		if(!$.isArray(xyzd))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({rotate3D:xyzd},duration,easing,function(){
			var THIS=this;
			if($.isFunction(callback)) setTimeout(function(){callback.call(THIS);},1);
			this.attr('rotate3D',[0,0,0,0]);
		});
	}
	R_el.rotateX=function(degree,duration,easing,callback,referencePoint){
		if(isNaN(degree))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({rotateX:degree},duration,easing,callback);
	}
	R_el.rotateY=function(degree,duration,easing,callback,referencePoint){
		if(isNaN(degree))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({rotateY:degree},duration,easing,callback);
	}
	R_el.rotateZ=function(degree,duration,easing,callback,referencePoint){
		if(isNaN(degree))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({rotateZ:degree},duration,easing,callback);
	}
	R_el.skewXY=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewXY:amount},duration,easing,callback);
	}
	R_el.skewXZ=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewXZ:amount},duration,easing,callback);
	}
	R_el.skewYX=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewYX:amount},duration,easing,callback);
	}
	R_el.skewYZ=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewYZ:amount},duration,easing,callback);
	}
	R_el.skewZX=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewZX:amount},duration,easing,callback);
	}
	R_el.skewZY=function(amount,duration,easing,callback,referencePoint){
		if(isNaN(amount))return false;
		(isPoint(referencePoint) || isDot(referencePoint)) && this.reference(referencePoint);
		return this.animate({skewZY:amount},duration,easing,callback);
	}
	//3D转换的Raphael集合遍历通用方法
	function RaphaelSetIterate(set,action,args){
		set.forEach(function(element){
			element[action].apply(element,args);
		});
		return set;
	}
	R_st.translate3D=function(){return RaphaelSetIterate(this,"translate3D",arguments);}
	R_st.translateX=function(){return RaphaelSetIterate(this,"translateX",arguments);}
	R_st.translateY=function(){return RaphaelSetIterate(this,"translateY",arguments);}
	R_st.translateZ=function(){return RaphaelSetIterate(this,"translateZ",arguments);}
	R_st.scale3D=function(){return RaphaelSetIterate(this,"scale3D",arguments);}
	R_st.scaleX=function(){return RaphaelSetIterate(this,"scaleX",arguments);}
	R_st.scaleY=function(){return RaphaelSetIterate(this,"scaleY",arguments);}
	R_st.scaleZ=function(){return RaphaelSetIterate(this,"scaleZ",arguments);}
	R_st.flipX=function(){return RaphaelSetIterate(this,"flipX",arguments);}
	R_st.flipY=function(){return RaphaelSetIterate(this,"flipY",arguments);}
	R_st.flipZ=function(){return RaphaelSetIterate(this,"flipZ",arguments);}
	R_st.flipXY=function(){return RaphaelSetIterate(this,"flipXY",arguments);}
	R_st.flipYZ=function(){return RaphaelSetIterate(this,"flipYZ",arguments);}
	R_st.flipXZ=function(){return RaphaelSetIterate(this,"flipXZ",arguments);}
	R_st.projectXY=function(){return RaphaelSetIterate(this,"projectXY",arguments);}
	R_st.projectYZ=function(){return RaphaelSetIterate(this,"projectYZ",arguments);}
	R_st.projectXZ=function(){return RaphaelSetIterate(this,"projectXZ",arguments);}
	R_st.rotate3D=function(){return RaphaelSetIterate(this,"rotate3D",arguments);}
	R_st.rotateX=function(){return RaphaelSetIterate(this,"rotateX",arguments);}
	R_st.rotateY=function(){return RaphaelSetIterate(this,"rotateY",arguments);}
	R_st.rotateZ=function(){return RaphaelSetIterate(this,"rotateZ",arguments);}
	R_st.skewXY=function(){return RaphaelSetIterate(this,"skewXY",arguments);}
	R_st.skewXZ=function(){return RaphaelSetIterate(this,"skewXZ",arguments);}
	R_st.skewYX=function(){return RaphaelSetIterate(this,"skewYX",arguments);}
	R_st.skewYZ=function(){return RaphaelSetIterate(this,"skewYZ",arguments);}
	R_st.skewZX=function(){return RaphaelSetIterate(this,"skewZX",arguments);}
	R_st.skewZY=function(){return RaphaelSetIterate(this,"skewZY",arguments);}
	//重写一些方法
	var raphael_remove=R_el.remove,
		raphael_show=R_el.show,
		raphael_hide=R_el.hide;
	R_el.remove=function(){
		var set;
		switch(this.data('__model'))
		{
			case names.dot:
				set=stage.shapes.dots;
				break;
			case names.polyline:
				set=stage.shapes.polylines;
				break;
			case names.polygon:
				set=stage.shapes.polygons;
				break;
			case names.polytope:
				set=stage.shapes.polytopes;
				break;
		}
		set && (triggerEvents(this,'remove'),set.exclude(this));
		raphael_remove.call(this);
	}
	R_el.show=function(){
		raphael_show.call(this);
		triggerEvents(this,'show');
		return this;
	}
	R_el.hide=function(){
		raphael_hide.call(this);
		triggerEvents(this,'hide');
		return this;
	}
	R_el.fadeOut=function(duration,easing,callback){
		return this.animate({opacity:0},duration,easing,function(){
			triggerEvents(this,'hide');
			$.isFunction(callback) && callback.call(this);
		});
	}
	R_el.fadeIn=function(duration,easing,callback){
		return this.animate({opacity:1},duration,easing,function(){
			triggerEvents(this,'show');
			$.isFunction(callback) && callback.call(this);
		});
	}
	R_st.remove=function(){return RaphaelSetIterate(this,'remove');}
	R_st.show=function(){return RaphaelSetIterate(this,'show');}
	R_st.hide=function(){return RaphaelSetIterate(this,'hide');}
	R_st.fadeIn=function(){return RaphaelSetIterate(this,'fadeIn',arguments);}
	R_st.fadeOut=function(){return RaphaelSetIterate(this,'fadeOut',arguments);}
	//生成一个空的原始的自定义事件对象数据
	function emptyEvents(){
		var o={};
		for(var n=0;n<eventNames.length;n++) o[eventNames[n]]=[];
		return o;
	}
	//修补被误删除的自定义事件对象数据
	function repaireEvents(element){
		var events=element.data(names.events);
		//没有数据直接生成数据，有数据则查看它是否完整
		if(!events) element.data(names.events,emptyEvents());
		else for(var n=0;n<eventNames;n++)
			!$.isArray(events[eventNames[n]]) && (events[eventNames[n]]=[]);
	}
	//触发自定义事件
	function triggerEvents(THIS,eventname){
		repaireEvents(THIS);
		var events=THIS.data(names.events)[eventname];
		for(var n=0;n<events.length;n++)
			$.isFunction(events[n]) && events[n].call(THIS);
	}
		
	//给元素绑定自定义事件，支持的事件在events数组中
	R_el.on=function(eventname,handler){
		if(!eventname || $.inArray(eventname,eventNames)<0 || !$.isFunction(handler)) return false; 
		repaireEvents(this);
		var events=this.data(names.events);
		events[eventname].push(handler);
		return this;
	}
	R_st.on=function(){return RaphaelSetIterate(this,'on',arguments);}
	//给元素解绑事件，如果不设置handler则解绑对应事件的所有处理函数
	R_el.off=function(eventname,handler){
		if(!eventname || $.inArray(eventname,eventNames)<0 || handler!==undefined && !$.isFunction(handler)) return false; 
		repaireEvents(this);
		var events=this.data(names.events)[eventname],
			index;
		handler && (//删除指定的事件处理函数
			index=$.inArray(handler,events),
			index>=0 && events.splice(index,1),
			true
		) ||
		(//删除所有事件处理函数
			this.data(names.events)[eventname]=null,
			this.data(names.events)[eventname]=[]
		)
		return this;
	}
	R_st.off=function(){return RaphaelSetIterate(this,'off',arguments);}
	///////////////////////////////////////////////////////////////////////图形点
	/*
	dot对象的专用属性，用来记录dot的三维坐标，可以使用的参数形式有
	1. 三个数字
	2. 一个拥有3个元素的数字数组
	3. 另一个模型点对象
	4. 一个数据点对象
	*/
	R_ca.point=function(x,y,z){
		if(this.data('__model')!=names.dot)return false;
		var position=[x,y,z];
		project.call(position);
		var cx=position.x,cy=position.y;
		return {cx:cx,cy:cy};
	}
	var transform3Dattrs={
		translateX:0,
		translateY:0,
		translateZ:0,
		rotate3D:[0,0,0,0],
		rotateX:0,
		rotateY:0,
		rotateZ:0,
		skewXY:0,
		skewXZ:0,
		skewYX:0,
		skewYZ:0,
		skewZX:0,
		skewZY:0,
		scaleX:1,
		scaleY:1,
		scaleZ:1
	};
	stage.dot=function(){
		var arg=arguments,x,y,z;
		switch(arg.length)
		{
			case 1:
				arg=arg[0];
				var bd;
				if(!isPoint(arg) && !(bd=isDot(arg))) return false;
				bd && (arg=arg.attr('point'));
				break;
			case 3: break;
			default: return false;
		}
		x=arg[0];
		y=arg[1];
		z=arg[2];
		var object=paper.circle(0,0,1)
			.data({
				'__model':names.dot,
				'__reference_point':[0,0,0]
			})
			.attr({
				fill:'#000',
				stroke:false,
				point:[x,y,z]
			})
			.data(names.events,emptyEvents())
			.attr(transform3Dattrs);
		
		this.shapes.dots.push(object);
		return object;
	}
	
	isDot=function(o){var arr;return o && o.type=='circle' && o.data('__model')==names.dot && (arr=o.attr('point'));}
	//将有序点整理成路径，返回空对象及原始路径（折线不加z，多边形要加z）
	function points2path(){
		var object=paper.path('M0,0')
			.data('__reference_point',[0,0,0])
			.attr(names.events,emptyEvents())
			.attr(transform3Dattrs),
			arg=arguments,
			path=[],points=[],bd,p,xyz;
		for(var n=0;n<arg.length;n++)
		{
			p=arg[n];
			((bd=isDot(p)) || isPoint(p)) && (
				bd && (p=p.attr('point')),
				xyz=[p[0],p[1],p[2]],
				points.push([p[0],p[1],p[2]]),
				project.call(xyz),
				path.push(fix(xyz.x)+','+fix(xyz.y)),
				xyz=null
			);
		}
		path.join('L');
		object.data('__points',points)//.attr('path','M'+path);
		return {shape:object,path:'M'+path};
	}
	//折线，使用数据点或模型点作为参数，不要使用矢量填充属性，因为折线是非闭合图形
	stage.polyline=function(){
		var result=points2path.apply(null,arguments),
			object=result.shape,
			path=result.path;
		object.data('__model',names.polyline);
		result=null;
		this.shapes.polylines.push(object);
		return object;
	}
	//多边形，参数同折线，可以使用填充
	stage.polygon=function(){
		//必须至少3个点
		if(arguments.length<3)return false;
		var result=points2path.apply(null,arguments),
			object=result.shape,
			path=result.path;
		if(object.data('__points').length<3) return false;
		object.data('__model',names.polygon)
			.attr({
				fill:'#fff',
				stroke:'#000',
				path:path+'Z'
			});
		result=null;
		this.shapes.polygons.push(object);
		return object;
	}
	//返回图形的中心点坐标，即各端点坐标平均数，可用于polyline、polygon、polytope
	R_el.center=function(){
		var model=this.data('__model');
		if($.inArray(model,[names.polygon,names.polyline,names.polytope,names.polyhedron])==-1)return false;
		var ps=this.data('__points'),xyz=[0,0,0],len=ps.length;
		for(var n=0;n<len;n++)
			for(var m=0;m<3;m++)
				xyz[m]+=ps[n][m];
		for(var m=0;m<3;m++) xyz[m]/=len;
		return xyz;
	}
	//返回图形的有效节点数，一般用来测试
	R_el.nodes=function(){
		return $.inArray(this.data('__model'),[names.polygon,names.polyline,names.polytope,names.polyhedron])==-1
			? false : this.data('__points').length;
	}
	/*
	多面体，使用点集，及各面点顺序序号构造图形
	点参数可以使用point或dot对象，最少4个点
	面序号，各个面用分号隔开，每个面的各点按顺序用逗号隔开，序号从1开始，根据前边的点参数顺序而定
	*/
	function points_and_sides(){
		try{
			var arg=arguments,len=arg.length,pointsnum=len-1;
			if(len<5) throw "最少需要5个参数";
			var sides=arg[len-1].split(';');
			if(sides.length<4) throw "最少是四面体";
			var points=[],//最终合法点集
				sidesnum=sides.length,//最终面数
				LEN=sidesnum,
				CX=0,CY=0,CZ=0,//体中心点
				SIDES=[]//最终面集
			;
			//整理并生成点集，顺便求多面体的体中心
			for(var n=0;n<len-1;n++)
			{
				var p=arg[n],bd;
				if(!isPoint(p) && !(bd=isDot(p)))
				{
					pointsnum--;
					if(pointsnum<4) throw "参数点存在不合法，导致可用点少于4个";
					continue;
				}
				bd && (p=p.attr('point'));
				points.push([p[0],p[1],p[2]]);
				CX+=p[0];
				CY+=p[1];
				CZ+=p[2];
			}
			CX/=pointsnum;
			CY/=pointsnum;
			CZ/=pointsnum;
			
			//整理面集
			for(var n=0;n<LEN;n++)
			{
				var pts=sides[n].split(','),nodes=pts.length;
				if(nodes<3)
				{
					sidesnum--;
					if(sidesnum<4) throw "面参数存在不合法，导致可用面少于4个";
					continue;
				}
				//查找本面各个点，是否合法
				for(var m=0;m<nodes;m++)
				{
					var pIndex=pts[m]-1;
					if(pIndex>pointsnum) throw "因为点参数不合法，导致面参数不可用：序号"+pIndex;
				}
				SIDES.push(sides[n]);
			}
			return {
				points:points,
				sides:SIDES.join(';'),
				center:[CX,CY,CZ]
			};
		}catch(e){
			console.log(e.message);
			return false;
		}
	}
	stage.polytope=function(){
		var result=points_and_sides.apply(null,arguments);
		if(!result) return false;
		var points=result.points,
			CX=result.center[0],
			CY=result.center[1],
			CZ=result.center[2],
			PATH=[],
			sides=result.sides.split(';'),
			sidesnum=sides.length
		;
		result=null;
		//整理面集并生成路径
		for(var n=0;n<sidesnum;n++)
		{
			var pts=sides[n].split(','),nodes=pts.length;
			//获取各个点，求面中心、路径（此处不验证平面上各点共面性）
			var cx=0,cy=0,cz=0,path=[];
			for(var m=0;m<nodes;m++)
			{
				var p=points[pts[m]-1];
				p=[p[0],p[1],p[2]];
				cx+=p[0];
				cy+=p[1];
				cz+=p[2];
				project.call(p);
				path.push(fix(p.x)+','+fix(p.y));
				p=null;
			}
			cx/=nodes;
			cy/=nodes;
			cz/=nodes;
			path='M'+path.join('L')+'Z';
			
			sideVisible([CX,CY,CZ],[cx,cy,cz],points[pts[0]-1],points[pts[1]-1],points[pts[2]-1]) && PATH.push(path);
			pts=null;
		}
		var object=paper.path(PATH.join(''))
			.attr(names.events,emptyEvents())
			.attr(transform3Dattrs)
			.data({
				'__reference_point':[0,0,0],
				'__points':points,
				'__sides':sides.join(';'),
				'__model':names.polytope
			})
			.attr({
				fill:'#fff',
				stroke:'#000'
			});
		this.shapes.polytopes.push(object);
		return object;
	}
	//测试平面是否可见，参数分别为体心，面心，平面上三点
	function sideVisible(topeCenter,sideCenter,p1,p2,p3){
		//求平面的“向外指”的法向量
		var CX=topeCenter[0],CY=topeCenter[1],CZ=topeCenter[2],
			cx=sideCenter[0],cy=sideCenter[1],cz=sideCenter[2],
			vcx=cx-CX,vcy=cy-CY,vcz=cz-CZ,//体心-面心向量
			vax=p1[0]-p2[0],vay=p1[1]-p2[1],vaz=p1[2]-p2[2],//平面上两向量
			vbx=p1[0]-p3[0],vby=p1[1]-p3[1],vbz=p1[2]-p3[2],
			vnx=vay*vbz-vaz*vby,//平面其中一个法向量
			vny=vaz*vbx-vax*vbz,
			vnz=vax*vby-vay*vbx;
		
		//取与体心-面心向量方向相同的那个法向量（凸多面体，体中心永远在图形里边，夹角余弦不为0）
		(vnx*vcx+vny*vcy+vnz*vcz)<0 && (vnx*=-1,vny*=-1,vnz*=-1);
		var q=GlobalPerspective,
			t=GlobalSkewXY,
			p=GlobalSkewZY,
			ratio=(1+cy*q),
			vx=(cx*q-t)/ratio,//逆视线向量
			vz=(cz*q+p)/ratio,
			vy=1;
		
		//逆视线向量要与基础逆视线(-theta,1,-phi)同向
		(-t*vx+1*vy-p*vz)<0 && (vx*=-1,vy*=-1,vz*=-1);
		//当法向量与逆视线向量同向时，平面可见，推入多面体路径中
		topeCenter=sideCenter=p1=p2=p3=pts=null;
		return (vx*vnx+vy*vny+vz*vnz)>0;
	}
	//拼合式多面体，由多个多边形组合而成，构造方法与polytope类似
	stage.polyhedron=function(){
		var result=points_and_sides.apply(null,arguments);
		if(!result) return false;
		var points=result.points,
			CX=result.center[0],
			CY=result.center[1],
			CZ=result.center[2],
			polygons=paper.set(),
			sides=result.sides.split(';'),
			sidesnum=sides.length
		;
		result=null;
		//整理面集并生成路径
		for(var n=0;n<sidesnum;n++)
		{
			var pts=sides[n].split(','),nodes=pts.length,ps=[];
			//获取各个点，求面中心、路径（此处不验证平面上各点共面性）
			var cx=0,cy=0,cz=0;
			for(var m=0;m<nodes;m++)
			{
				var p=points[pts[m]-1];
				p=[p[0],p[1],p[2]];
				ps.push(p);
				cx+=p[0];
				cy+=p[1];
				cz+=p[2];
				p=null;
			}
			cx/=nodes;
			cy/=nodes;
			cz/=nodes;
			
			var result=points2path.apply(null,ps),
				path=result.path+'Z',
				polygon=result.shape.attr({
					path:path,
					fill:'#fff',
					stroke:'#000',
					title:sides[n]
				}).data({
					'__model':names.polyhedron,
					'__hedron':polygons
				});
			polygons.push(polygon.hide());
			sideVisible([CX,CY,CZ],[cx,cy,cz],points[pts[0]-1],points[pts[1]-1],points[pts[2]-1]) && polygon.show();
			pts=polygon=null;
		}
		points=sides=null;
		polygons.center=hedronCenter;
		polygons.nodes=hedronNodes;
		return polygons;
	}
	//拼合多面体的中心
	function hedronCenter(){
		var cx=0,cy=0,cz=0,l=this.length;
		this.forEach(function(polygon){
			var center=polygon.center();
			cx+=center[0];
			cy+=center[1];
			cz+=center[2];
		});
		cx/=l; cy/=l; cz/=l;
		return [cx,cy,cz];
	}
	//拼合多面体的端点数
	function hedronNodes(){
		var n=0;
		this.forEach(function(polygon){
			n+=polygon.nodes();
		});
		return 2-this.length+n/2;
	}
	
	//正四面体，重心在原点，一个顶点在z+上，一个顶点在y+oz-平面上
	stage.tetrahedron=function(r,bool){
		var x=r*.75,
			y=sqrt(3)*r/4,
			z=r/2;
		return this[bool ? "polyhedron":"polytope"](
			[-x,-y,-z],
			[x,-y,-z],
			[0,2*y,-z],
			[0,0,r],
			'1,2,3;1,2,4;1,3,4;2,3,4'
		);
	}
	//正六面体，重心在原点，八个顶点分别在八个卦限上，互为镜像
	stage.cube=function(r,bool){
		r/=sqrt(3);
		return this[bool ? "polyhedron":"polytope"](
			[-r,-r,-r],[r,-r,-r],[r,r,-r],[-r,r,-r],
			[-r,-r,r],[r,-r,r],[r,r,r],[-r,r,r],
			'1,2,3,4;1,2,6,5;2,3,7,6;3,4,8,7;1,4,8,5;5,6,7,8'
		);
	}
	//正八面体，中心截面在x+oy+上，六个顶点分别在坐标轴六个方向上
	stage.octahedron=function(r,bool){
		return this[bool ? "polyhedron":"polytope"](
			[r,0,0],[0,r,0],[-r,0,0],
			[0,-r,0],[0,0,r],[0,0,-r],
			'1,2,6;1,2,5;1,4,6;1,4,5;3,2,5;3,2,6;3,4,5;3,4,6'
		);
	}
	//正十二面体，中心点在原点上
	stage.dodecahedron=function(r,bool){
		var R=r/sqrt(3);
		r=(sqrt(5)-1)/2;
		var r_=1/r;
		r*=R,r_*=R;
		return this[bool ? "polyhedron":"polytope"](
			[0,r_,r],[0,-r_,r],[0,r_,-r],[0,-r_,-r],
			[r_,r,0],[-r_,r,0],[r_,-r,0],[-r_,-r,0],
			[r,0,r_],[r,0,-r_],[-r,0,r_],[-r,0,-r_],
			[R,R,R],[-R,R,R],[R,-R,R],[R,R,-R],
			[-R,-R,R],[-R,R,-R],[R,-R,-R],[-R,-R,-R],
			'1,3,16,5,13;1,3,18,6,14;1,13,9,11,14;7,5,13,9,15;7,5,16,10,19;2,4,19,7,15;2,17,11,9,15;6,8,17,11,14;6,8,20,12,18;2,4,20,8,17;4,20,12,10,19;3,16,10,12,18'
		);
	}
	return stage;
}
