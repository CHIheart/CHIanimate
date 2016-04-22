//基于Raphael.js的3D模型库
var GlobalProjection="topView";
var GlobalQ=0.0058;
var GlobalTheta=a2t(0);
var GlobalPhi=a2t(0);
var GlobalTransX=0;
var GlobalTransY=0;
var GlobalTransZ=0;
var GlobalPointR=2;
var GlobalMaxX=3000;
var GlobalMaxZ=3000;
var GlobalSkewXY=-0.354;
var GlobalSkewZY=0.354;
var DEVIATION=1/pow(10,DECIMAL);

function isModelPoint3D(o){return o && o.data && o.data("model")=="point3D";}
function projection(o)
{//先做平移，然后做XOY平面反射（因为屏幕坐标系的纵轴正方向向下），最后投影
	if(!isPoint3D(o))return undefined;
	var newO=o.translate(GlobalTransX,GlobalTransY,GlobalTransZ).flipXY()[GlobalProjection]({
		skewXY:GlobalSkewXY,
		skewZY:GlobalSkewZY,
		theta:GlobalTheta,
		phi:GlobalPhi,
		q:GlobalQ
	});
	return newO;
}
function getViewVector()
{//获取视角向量（由原点出发，直指向观察者的向量）
	switch(GlobalProjection)
	{
		case "topView":
			return CHIvector3D(0,0,1);
		case "sideView":
			return CHIvector3D(1,0,0);
		case "frontView":
			return CHIvector3D(0,1,0);
		case "projNA":
			return CHIvector3D({r:100,p:-PI/2-GlobalTheta,t:PI/2-GlobalPhi}).neg();
		case "projOA":
			return CHIvector3D(0,1,0).skewXY(-GlobalSkewXY).skewZY(-GlobalSkewZY);
		default:return false;
	}
}

/*
3D模型点，使用3D数据点做为参数，此数据点是原始数据，未经过投影的点
本方法返回的是Raphael的circle元素
元素保留原始的三维数据点，为data的point键
*/
Raphael.fn.point3D=function(){
	var arg=arguments;
	if(!isPoint3D(arg[0]) && arg.length<3)return false;
	var point;
	if(isPoint3D(arg[0])) point=CHIpoint3D(arg[0]);
	else point=CHIpoint3D(float(arg[0]),float(arg[1]),float(arg[2]));
	var pt=projection(point),cx=fix(min(pt.x,GlobalMaxX)),cy=fix(min(pt.z,GlobalMaxZ));
	return this.circle(cx,cy,GlobalPointR).data({
		model:"point3D",
		point:point
	});
}
//画出模型点的半径线（与原点的连线），或重绘/删除半径线
Raphael.el.radius3D=function(remove){
	if(!isModelPoint3D(this))return this;
	if(!remove)
	{
		var p=this.data("point"),p0=CHIpoint3D(0,0,0);
		if(this.data("radius"))//重绘半径线
		{
			var P=projection(p),P0=projection(p0);
			this.data("radius").attr({path:'M'+P.x+','+P.z+'L'+P0.x+','+P0.z});
		}
		else//建立半径线
		{
			this.data({
				radius:this.paper.line3D(p,p0).attr({'stroke-dasharray':'. '})
			})
		}
	}
	else if(this.data("radius"))
	{
		delete(this.data("radius"));
		this.removeData("radius");
	}
	return this;
}
//画出模型点的三条坐标线，或重绘/删除坐标线
Raphael.el.coLines3D=function(remove){
	if(!isModelPoint3D(this))return this;
	if(!remove)
	{
		var p=this.data("point");
		var px=CHIpoint3D(p.x,0,0),
			py=CHIpoint3D(0,p.y,0),
			pz=CHIpoint3D(0,0,p.z),
			pxy=CHIpoint3D(p.x,p.y,0),
			pxz=CHIpoint3D(p.x,0,p.z),
			pyz=CHIpoint3D(0,p.y,p.z)
		;
		if(this.data("lines"))//重绘坐标线
		{
			var P=projection(p),
				PX=projection(px),
				PY=projection(py),
				PZ=projection(pz),
				PXY=projection(pxy),
				PXZ=projection(pxz),
				PYZ=projection(pyz);
			var paths=[
				'M'+ P.x +','+ P.z +'L'+ PXY.x +','+ PXY.z,
				'M'+ P.x +','+ P.z +'L'+ PXZ.x +','+ PXZ.z,
				'M'+ P.x +','+ P.z +'L'+ PYZ.x +','+ PYZ.z,
				'M'+ PX.x +','+ PX.z +'L'+ PXY.x +','+ PXY.z,
				'M'+ PY.x +','+ PY.z +'L'+ PXY.x +','+ PXY.z,
				'M'+ PX.x +','+ PX.z +'L'+ PXZ.x +','+ PXZ.z,
				'M'+ PY.x +','+ PY.z +'L'+ PYZ.x +','+ PYZ.z,
				'M'+ PZ.x +','+ PZ.z +'L'+ PYZ.x +','+ PYZ.z,
				'M'+ PZ.x +','+ PZ.z +'L'+ PXZ.x +','+ PXZ.z
			],n=0;
			this.data("lines").forEach(function(ele){
				ele.attr({path:paths[n]});
				n++;
			});
		}
		else//建立坐标线
		{
			var paper=this.paper,st=paper.set();
			st.push(
				paper.line3D(p,pxy).attr({'stroke-dasharray':'. '}),
				paper.line3D(p,pxz).attr({'stroke-dasharray':'. '}),
				paper.line3D(p,pyz).attr({'stroke-dasharray':'. '}),
				paper.line3D(px,pxy).attr({'stroke-dasharray':'. '}),
				paper.line3D(py,pxy).attr({'stroke-dasharray':'. '}),
				paper.line3D(px,pxz).attr({'stroke-dasharray':'. '}),
				paper.line3D(py,pyz).attr({'stroke-dasharray':'. '}),
				paper.line3D(pz,pyz).attr({'stroke-dasharray':'. '}),
				paper.line3D(pz,pxz).attr({'stroke-dasharray':'. '})
			);
			this.data({
				lines:st
			});
		}
	}
	else if(this.data("lines"))
	{
		this.data("lines").forEach(function(ele){
			ele.remove();
			delete(ele);
		});
		this.removeData("lines");
	}
	return this;
}
/*
3D模型直线，可以使用数据点或模型点创建
本方法返回的是Raphael的path元素
元素保留定义的两点，分别为data的p1/p2，都是point3D点
*/
Raphael.fn.line3D=function(point1,point2){
	var ps1,ps2,x1,y1,x2,y2;
	if(isPoint3D(point1))
	{//数据点，则直接保留，并投影
		ps1=CHIpoint3D(point1);
		var proj=projection(point1);
		x1=min(proj.x,GlobalMaxX);
		y1=min(proj.z,GlobalMaxZ);
	}
	else if(isModelPoint3D(point1))
	{//如果是3D点则获取数据点
		ps1=CHIpoint3D(point1.data("point"));
		x1=point1.attr("cx");
		y1=point1.attr("cy");
	}
	else return undefined;
	
	if(isPoint3D(point2))
	{//数据点，则直接保留，并投影
		ps2=CHIpoint3D(point2);
		var proj=projection(point2);
		x2=min(proj.x,GlobalMaxX);
		y2=min(proj.z,GlobalMaxZ);
	}
	else if(isModelPoint3D(point2))
	{//如果是3D点则获取数据点
		ps2=CHIpoint3D(point2.data("point"));
		x2=point2.attr("cx");
		y2=point2.attr("cy");
	}
	else return undefined;
	
	var str=Raphael.format('M{0},{1}L{2},{3}',fix(x1),fix(y1),fix(x2),fix(y2));
	return this.path(str).data({
		model:'line3D',
		point1:ps1,
		point2:ps2
	});
}
/*
3D模型多边形，可以接收paper.set，Array，或单纯的参数列表，每个参数元素都必须是一个数据点或模型点，点是有序的
本方法返回的是Raphael的path元素
元素保留定义点集合，是data的points，是CHIpoint3D对象的Array
*/
Raphael.fn.polygon3D=function(){
	var arg=arguments,ps=[];
	//先将参数整理到PS数组当中
	if(arg.length>2 || isArr(arg[0]))
	{
		if(isArr(arg[0])) arg=arg[0];
		for(var x=0;x<arg.length;x++)
			ps.push(arg[x]);
	}
	else if(arg[0].type=='set')
	{
		if(!arg[0].forEach) return undefined;
		arg[0].forEach(function(ele){
			ps.push(ele);
		});
	}
	else return undefined;
	//将所有模型点，转化成数据点
	var path='';
	var points=[];
	for(var x=0;x<ps.length;x++)
	{
		var point=ps[x],proj;
		if(isPoint3D(point))
		{
			proj=projection(point);
			points.push(CHIpoint3D(point));
		}
		else if(isModelPoint3D(point))
		{
			var pp=point.data("point");
			var temp=CHIpoint3D(pp);
			proj=projection(temp);
			points.push(temp);
		}
		else continue;//不符合类型的则自动忽略
		path+=(points.length==1 ? 'M':'L') + proj.x +','+ proj.z;
	}
	path+='Z';
	return this.path(path).data({
		model:'polygon3D',
		points:points
	});
}
/*
3D棱锥，给定顶点及底面各点的数组或Raphael.set，点是有序的且至少要有3个点
本方法返回的是Raphael的set对象，每个对象中的元素都是polygon3D对象
*/
Raphael.fn.pyramid=function(apex,points){
	var pt,ps=[];
	if(isPoint3D(apex))
	{
		pt=apex;
	}
	else if(isModelPoint3D(apex))
	{
		pt=apex.data("point");
	}
	else return undefined;
	
	//整理参数数组
	if(isArr(points)) ps=points;
	else if(points.type && points.type=='set')
	{
		if(!points.forEach) return undefined;
		points.forEach(function(ele){
			ps.push(ele);
		});
	}
	else return undefined;
	
	var pts=[];
	//再整理点
	for(var x=0;x<ps.length;x++)
	{
		var p=ps[x];
		if(isPoint3D(p))
		{
			pts.push(p);
		}
		else if(isModelPoint3D(p))
		{
			pts.push(p.data("point"));
		}
		else continue;
	}
	
	var l=pts.length;
	if(l<3)return undefined;
	var st=this.set();
	for(var x=0;x<l;x++)
	{
		var n=(x+1)%l;
		st.push(this.polygon3D(pt,pts[x],pts[n]));
	}
	st.push(this.polygon3D(points));
	return st;
}
/*
3D棱柱，参数使用高度，底面各点的数组或Raphael.set，点是有序的且至少要有3个点
height，如果使用一个数字，则为Z正方向（实际是向下）的高度
		如果写成对象，可以有键x/y/z，分别向不同方向平移后产生的高度效果
		如果是数组，则[0]=>x，[1]=>y，[2]=>z
本方法返回的是Raphael的set对象，对象中每个元素都为polygon3D对象
*/
Raphael.fn.prism=function(points,height){
	var trans={};
	if(!isNaN(height))
	{
		trans={x:0,y:0,z:float(height)};
	}
	else if(isArr(height))
	{
		trans={
			x: height[0] ? float(height[0]) : 0,
			y: height[1] ? float(height[1]) : 0,
			z: height[2] ? float(height[2]) : 0
		};
	}
	else if(isObj(height))
	{
		trans={
			x: height.x ? float(height.x) : 0,
			y: height.y ? float(height.y) : 0,
			z: height.z ? float(height.z) : 0
		};
	}
	else return undefined;
	//至少要有一个方向上的位移
	if(!trans.x && !trans.y && !trans.z) return undefined;
	
	//整理参数数组
	var ps=[];
	if(isArr(points)) ps=points;
	else if(points.type && points.type=='set')
	{
		if(!points.forEach) return undefined;
		points.forEach(function(ele){
			ps.push(ele);
		});
	}
	else return undefined;
	
	var tops=[],bottoms=[];
	//再整理点
	for(var x=0;x<ps.length;x++)
	{
		var p=ps[x];
		if(isPoint3D(p))
		{
			tops.push(p);
		}
		else if(isModelPoint3D(p))
		{
			tops.push(p.data("point"));
		}
		else continue;
		bottoms.push(tops[tops.length-1].translate(trans.x,trans.y,trans.z));
	}
	if(tops.length!=bottoms.length || tops.length<3)return undefined;
	
	var l=tops.length;
	var st=this.set();
	for(var x=0;x<l;x++)
	{
		var n=(x+1)%l;
		st.push(this.polygon3D(tops[x],tops[n],bottoms[n],bottoms[x]));
	}
	st.push(this.polygon3D(tops));
	st.push(this.polygon3D(bottoms));
	return st;
}
//重绘动作，绘制的是动画数据点
Raphael.el.redraw=function(){
	switch(this.data("model"))
	{
		case "point3D":
			var pp=this.data("point");
			var pt=projection(pp),cx=fix(min(pt.x,GlobalMaxX)),cy=fix(min(pt.z,GlobalMaxZ));
			this.attr({
				cx:cx,
				cy:cy,
				r:GlobalPointR
			});
			if(this.data("lines")) this.coLines3D();
			if(this.data("radius")) this.radius3D();
			break;
		case "line3D":
			var p1=projection(this.data('point1')),p2=projection(this.data('point2'));
			this.attr({
				path:'M'+ fix(min(p1.x,GlobalMaxX)) +','+ fix(min(p1.z,GlobalMaxZ))
					+'L'+ fix(min(p2.x,GlobalMaxX)) +','+ fix(min(p2.z,GlobalMaxZ))
			});
			break;
		case "polygon3D":
			var path='',x=0;
			var ps=this.data("points");
			for(var x=0;x<ps.length;x++)
			{
				var p=ps[x],proj=projection(p),px=proj.x,py=proj.z;
				if(!x) path='M'+ px +','+ py;
				else path+='L'+ px +','+ py;
			}
			path+='Z';
			this.attr({path:path});
			break;
		default:;
			//不是使用3D模型建立的对象
	}
	return this;
}
Raphael.st.redraw=function(){
	this.forEach(function(ele){
		ele.redraw();
	});
	return this;
}
Raphael.fn.redraw=function(){
	this.forEach(function(ele){
		ele.redraw();
	});
	return this;
}
//因为translate已经定义过了，所以换个名
Raphael.el.translate3D=function(x,y,z){
	if(isNaN(x))x=0;
	if(isNaN(y))y=0;
	if(isNaN(z))z=0;
	return this.transform3D("translate",x,y,z);
}
Raphael.st.translate3D=function(x,y,z){
	this.forEach(function(ele){
		ele.translate3D(x,y,z);
	});
	return this;
}

Raphael.el.scale3D=function(x,y,z){
	if(isNaN(x))x=1;
	if(isNaN(y))y=x;
	if(isNaN(z))z=x;
	return this.transform3D("scale",x,y,z);
}
Raphael.st.scale3D=function(x,y,z){
	this.forEach(function(ele){
		ele.scale3D(x,y,z);
	});
	return this;
}

Raphael.el.skewXY=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewXY",d);
}
Raphael.st.skewXY=function(d){
	this.forEach(function(ele){
		ele.skewXY(d);
	});
	return this;
}

Raphael.el.skewXZ=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewXZ",d);
}
Raphael.st.skewXZ=function(d){
	this.forEach(function(ele){
		ele.skewXZ(d);
	});
	return this;
}

Raphael.el.skewYX=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewYX",d);
}
Raphael.st.skewYX=function(d){
	this.forEach(function(ele){
		ele.skewYX(d);
	});
	return this;
}

Raphael.el.skewYZ=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewYZ",d);
}
Raphael.st.skewYZ=function(d){
	this.forEach(function(ele){
		ele.skewYZ(d);
	});
	return this;
}

Raphael.el.skewZX=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewZX",d);
}
Raphael.st.skewZX=function(d){
	this.forEach(function(ele){
		ele.skewZX(d);
	});
	return this;
}

Raphael.el.skewZY=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("skewZY",d);
}
Raphael.st.skewZY=function(d){
	this.forEach(function(ele){
		ele.skewZY(d);
	});
	return this;
}

Raphael.el.rotateX=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("rotateX",d);
}
Raphael.st.rotateX=function(d){
	this.forEach(function(ele){
		ele.rotateX(d);
	});
	return this;
}

Raphael.el.rotateY=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("rotateY",d);
}
Raphael.st.rotateY=function(d){
	this.forEach(function(ele){
		ele.rotateY(d);
	});
	return this;
}

Raphael.el.rotateZ=function(d){
	if(isNaN(d))d=0;
	return this.transform3D("rotateZ",d);
}
Raphael.st.rotateZ=function(d){
	this.forEach(function(ele){
		ele.rotateZ(d);
	});
	return this;
}

Raphael.el.transform3D=function(){
	var arg=arguments,order=arg[0],a1,a2,a3;
	switch(order)
	{
		case "translate":
			a1=arg[1] ? float(arg[1]) : 0;
			a2=arg[2] ? float(arg[2]) : 0;
			a3=arg[3] ? float(arg[3]) : 0;
			break;
		case "scale":
			a1=arg[1] ? float(arg[1]) : 1;
			a2=arg[2] ? float(arg[2]) : a1;
			a3=arg[3] ? float(arg[3]) : a1;
			break;
		case "skewXY":
		case "skewXZ":
		case "skewYX":
		case "skewYZ":
		case "skewZX":
		case "skewZY":
		case "rotateX":
		case "rotateY":
		case "rotateZ":
			a1=arg[1] ? float(arg[1]) : 0;
			break;
	}
	switch(this.data("model"))
	{
		case "point3D":
			this.data({point : this.data("point")[order](a1,a2,a3)});
			break;
		case "line3D":
			this.data({
				point1:this.data("point1")[order](a1,a2,a3),
				point2:this.data("point2")[order](a1,a2,a3)
			})
			break;
		case "polygon3D":
			var ps=this.data("points");
			for(var n=0;n<ps.length;n++)
			{
				ps[n]=ps[n][order](a1,a2,a3);
			}
			break;
		default: return this;
	}
	//return this.redraw();
	return this;//这里为了加快速度，把redraw放在统一的变形过程当中，而不是每个元素都要执行一次redraw
}
Raphael.st.transform3D=function(order,args){
	this.forEach(function(ele){
		ele.transform3D(order,args);
	});
	return this;
}
//测试某个点是否是多边形顶点之一，暂时不处理其它图形的
Raphael.el.hasPoint=function(point){
	var p;
	if(isPoint3D(point))
	{
		p=point;
	}
	else if(isModelPoint3D(point))
	{
		p=point.data("point");
	}
	else return undefined;
	var points=this.data("points");
	for(var x=0;x<points.length;x++)
	{
		if(points[x].equal(p)) return true;
	}return false;
}
//集合相加，返回相加后的大集合
Raphael.st.join=function(st2){
	if(!st2.type=='set')return undefined;
	var nst=this.paper.set();
	this.forEach(function(ele){nst.push(ele);});
	st2.forEach(function(ele){nst.push(ele);});
	return nst;
}