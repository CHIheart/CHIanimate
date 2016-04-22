//形状库，所有的不正常都返回undefined，而不是false
function theta2angle(t){return 180*t/Math.PI;}
function angle2theta(a){return Math.PI*a/180;}
function isPoint(o)
{
	return o && (
		("x" in o) && ("y" in o)
		|| ("t" in o) && ("r" in o)
		|| o instanceof Array && o.length==2
	);
}
function isSamePoint(p1,p2)
{
	if(!isPoint(p1) || !isPoint(p2))return undefined;
	var pt1=new CHIpoint('temp_p1'),pt2=new CHIpoint('temp_p2');
	pt1.set(p1);pt2.set(p2);
	return p1.x==p2.x && p1.y==p2.y;
}
function distance(p1,p2)
{
	if(!isPoint(p1) || !isPoint(p2))return undefined;
	var pt1=new CHIpoint('temp_p1'),pt2=new CHIpoint('temp_p2');
	pt1.set(p1);pt2.set(p2);
	return Math.sqrt(Math.pow(pt1.x-pt2.x,2)+Math.pow(pt1.y-pt2.y,2));
}
function isLine3P(p1,p2,p3)
{
	if(!isPoint(p1) || !isPoint(p2) || !isPoint(p3) || isSamePoint(p1,p2) || isSamePoint(p3,p2) || isSamePoint(p1,p3))return undefined;
	var l=new CHIline('l');
	l.set2P(p1,p2);
	var p=new CHIpoint('p');
	p.setXY(p3.x,p3.y);
	return p.on(l);
}
/*
点类
.id(String)		ID
.shape="POINT"	(Const)形状名称
.x				(Number)x坐标
.y				(Number)y坐标
.r				(Number)r坐标
.t				(Number)theta坐标
.setXY(x,y)		(Void)设置xy坐标，将重计算rt坐标
.setRT(r,t)		(Void)设置rt坐标，将重计算xy坐标
.set(p)			(Void/undefined)使用不定属性的对象设置本点
.on(shape)		(Boolean/undefined)返回点是否在shape上，shape必须是Shape类的实例
.to(p)			(Number/undefined)返回两点距离，或点到直线距离
.distance(p)	to函数的别名
.at()			(String)返回点所在象限，可能是o（原点）、x、y、1、2、3、4
.quadrant()		at函数的别名
.get(type)		(String)返回点的xy表示法或rtheta表示法
.getPoint()		({x:x,y:y})返回本点的计算对象
.equal(p)		(Boolean/undefined)返回与参数是否是同一点
*/
function CHIpoint(id)
{
	this.id="CHIpoint_"+id;
	this.shape="POINT";
	this.setXY=function(x,y){
		this.x=x;this.y=y;
		this.t=this.theta=Math.atan(y/x);
		this.r=Math.sqrt(x*x+y*y);
	}
	this.setRT=function(r,t){
		this.r=r;this.t=this.theta=t;
		this.x=r*Math.cos(t);
		this.y=r*Math.sin(t);
	}
	this.set=function(p){
		if(("x" in p) && ("y" in p)) this.setXY(p.x,p.y);
		else if(("r" in p) && ("t" in p)) this.setRT(p.r,p.t);
		else return undefined;
	}
	this.on=function(shape){
		if(!shape.formula)return undefined;
		var x=this.x,y=this.y,r=this.r,t=this.t,f=shape.formula();
		f=f.replace('=','==');
		return eval(f)
	}
	this.distance=this.to=function(pORl){
		if(isPoint(pORl))
		{//两点距离
			var pt=new CHIpoint('temp_point');
			pt.set(p);
			return Math.sqrt(Math.pow(this.x-pt.x,2)+Math.pow(this.y-pt.y,2));
		}
		else if(!isShape(pORl) || pORl.shape!="LINE")	return undefined;
		//点到直线距离
		if(pORl.hasPoint(this)) return 0;
		var a=pORl.a,b=pORl.b,c=pORl.c,h=pORl.h,x=this.x,y=this.y;
		return Math.abs(a*x + b*y + c)/Math.sqrt(a*a + b*b);
	}
	this.quadrant=this.at=function(){
		if(this.x>=0)
		{
			if(this.y>0)return "1";
			else if(this.y<0)return "4";
			else if(this.x==0)return "o";
			else return "x";
		}
		else
		{
			if(this.y>0)return "2";
			else if(this.y<0)return "3";
			else return "y";
		}
	}
	this.get=function(type){
		if(type)type=type.toLowerCase();
		if(!type || type=="xy") return "("+ this.x +","+ this.y +")";
		else if(type=="rt") return "("+ this.r +","+ this.t +")";
		return undefined;
	}
	this.getPoint=function(){return {x:this.x,y:this.y}}
	this.equal=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return this.x==pt.x && this.y==pt.y;
	}
}
/*
向量类，基于点类
.shape='VECTOR'		(StringConst)图象名称
.set(p)				(Void/undefined)以一点设置向量
.set2P(p1,p2)		(Void/undefined)以两点设置向量，参数分别为起始点与终止点
.calculate()		(Void)计算向量的模/单位向量/反向量
.m	.module	.abs	(Number)向量的模
.neg	.negative	({x:x,y:y})反向量
.u	.unit			({x:x,y:y})单位向量
.plus(v)			({x:x,y:y}/undefined)向量的和
.add(v)				({x:x,y:y}/undefined)plus函数的别名
.minus(v)			({x:x,y:y}/undefined)本向量与参数向量的差
.substract(v)		({x:x,y:y}/undefined)minus函数的别名
.times(c)			({x:x,y:y}/undefined)向量与常量的积
.multi(c)			({x:x,y:y}/undefined)times函数的别名
.multiple(c)		({x:x,y:y}/undefined)times函数的别名
.inner(v)			(Number/undefined)向量的内积/点积，a·b=|a||b|cos<a,b>=ax*bx+ay*by
.outer(v)			(Number/undefined)向量的外积/叉积，a×b=|a||b|sin<a,b>=|ax*by-ay*bx|，方向垂直平面
.str8(v)			(Boolean/undefined)两向量是否垂直（点积为零）
.straight(v)		(Boolean/undefined)str8函数的别名
.parallel(v)		(Boolean/undefined)两向量是否平行（叉积为零）
.theta(v)			(Theta/undefined)返回两向量的夹角的弧度值
.start(pend)		({x:x,y:y})已知终点求起点坐标
.end(pstart)		({X:x,y:y})已知起点求终点坐标
*/
function CHIvector(id)
{
	this.id='CHIvector_'+id;
	this.shape='VECTOR';
	this.set=function(p){
		this.defined='p';
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		this.x=pt.x; this.y=pt.y;
		this.calculate();
	}
	this.set2P=function(p1,p2){
		this.defined='2p';
		if(!isPoint(p1) || !isPoint(p2))return undefined;
		var pt1=new CHIpoint('temp_p1'),pt2=new CHIpoint('temp_p2');
		pt1.set(p1); pt2.set(p2);
		this.x=pt2.x-pt1.x; this.y=pt2.y-pt1.y;
		this.calculate();
	}
	this.calculate=function(){
		this.m=this.module=this.abs=Math.sqrt(this.x*this.x+this.y*this.y);
		this.u=this.unit={x:this.x/this.m,y:this.y/this.m};
		this.neg=this.negative={x:this.x*-1,y:this.y*-1};
	}
	this.plus=this.add=function(v){
		if(!isPoint(v))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(v);
		return {x:this.x+p.x,y:this.y+p.y};
	}
	this.minus=this.substract=function(v){
		if(!isPoint(v))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(v);
		return {x:this.x-p.x,y:this.y-p.y};
	}
	this.times=this.multi=this.multiple=function(c){
		if(isNaN(c))return undefined;
		return {x:this.x*c,y:this.y*c};
	}
	this.inner=function(v){
		if(!isPoint(v))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(v);
		return this.x*p.x+this.y*p.y;
	}
	this.theta=function(v){
		if(!isPoint(v))return undefined;
		var V=new CHIvector('temp_vector');
		V.set(v);
		return Math.acos(this.inner(v)/this.m/V.m);
	}
	this.str8=this.straight=this.right=function(v){
		if(!isPoint(v))return undefined;
		return this.inner(v)===0;
	}
	this.outer=function(v){
		if(!isPoint(v))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(v);
		return Math.abs(this.x*p.y-this.y*p.x);
	}
	this.parallel=function(v){
		if(!isPoint(v))return undefined;
		return this.outer(v)===0;
	}
	this.start=function(pend){
		if(!isPoint(pend))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(pend);
		return {x:p.x-this.x,y:p.y-this.y};
	}
	this.end=function(pstart){
		if(!isPoint(pstart))return undefined;
		var p=new CHIpoint('temp_point');
		p.set(pstart);
		return {x:p.x+this.x,y:p.y+this.y};
	}
}
CHIvector.prototype=new CHIpoint();
/*
图象基本类
.id					ID
.defined			(String)定义方式
.shape				(StringConst)图象名称
.hasPoint(p)		(Boolean/undefined)返回是否包含一点
.relate(shape)		(StringEnum)返回与另一图形的关系，可能是相离、相交、平行、包含、相切等
.formula(type)		(String)返回图象的公式
.intersect(shape)	({x:x,y:y}/Array[{x:x,y:y}]/undefined)返回与另一图象的交点，可能是数组，无交点返回undefined
.tangent(point)		(Line/Array[Line])返回图象在某点的切线，可能是数组
.getX(y)			(Number/Array[Number]/undefined)通过y值计算x值
.getY(x)			(Number/Array[Number]/undefined)通过x值计算y值
.getPoint()			(Point/undefined)获取图象上一个点
*/
function CHIshape()
{
	this.id='';
	this.defined='';
	this.shape='';
	this.hasPoint=function(p){}
	this.relate=function(shape){
		/*
		返回字符串表示关系
		COINCIDE	重合
		PARALLEL	平行
		INTERSECT	相交
		TANGENT		相切
		IN			内含
		SEPARAT		相离
		*/
	}
	this.formula=function(){}
	this.intersect=function(shape){}
	this.tangent=function(point){}
	this.getX=function(y){}
	this.getY=function(x){}
	this.getPoint=function(){}
}
/*
直线类
.id				(String)ID
.shape="LINE"	(StringConst)图象名称
.defined		(String)定义方式
标准方程	ax+by+c=0
.a				(Number)标准方程，x系数
.b				(Number)标准方程，y系数
.c				(Number)标准方程，常数项
.setABC(a,b,c)	设置标准方程
斜率截距方程 y=kx+h
.k				(Number)斜率截距方程，斜率
.h				(Number)斜率截距方程，截距
.t=.theta		(NumberRadian)与x正方向夹角，弧度值
.setKH(k,h)		设置斜率截距方程
----------------
.set2P(p1,p2)	设置两点式方程，使用本方法会生成以下两个属性
.p1				(Point)两点式方程，定义点1
.p2				(Point)两点式方程，定义点2
----------------
.setPK(p,k)		设置点斜式方程，使用本方法会生成以下一个属性
.p				(Point)点斜式方程，定义点
----------------
.formula(type)	(String/undefined)返回方程，默认abc标准方程，type可以为kh返回斜率截距方程
.hasPoint(p)	(Boolean/undefined)返回点是否在直线上
.getX(y)		(Number)通过y值计算x值
.getY(x)		(Number)通过x值计算y值
.getPoint(x,y)	({x:x,y:y}/undefined)当双参全有时，如果此点在线上返回此点，不在则返回undefined；如果双参缺一，则计算另一值后返回点
.relate(shape)	(StringEnum)返回直线与另一形状的关系，目前参数只支持直线、抛物线、圆
.intersect(shape)	({x:x,y:y}/Array[{x:x,y:y}]/undefined)返回直线与另一形状的交点，目前参数只支持直线、抛物线、圆
.angle(line)	(NumberRadian)求两直线夹角，弧度值，有方向
*/
function CHIline(id)
{
	this.id="CHIline_"+id;
	this.shape="LINE";
	this.setABC=function(a,b,c){
		if(!a && !b)return undefined;
		this.defined="abc";
		if(a<0){a*=-1;b*=-1;c*=-1;}
		this.a=a;
		this.b=b;
		this.c=c;
		this.k=b?(a*-1/b):undefined;
		this.h=b?(c*-1/b):undefined;
		this.t=this.theta=b?Math.atan(this.k):Math.PI/2;
	}
	this.setKH=function(k,h){
		this.defined="kh";
		this.k=k;
		this.h=h;
		this.a=k;
		this.b=-1;
		this.c=h;
		this.t=this.theta=Math.atan(k);
	}
	this.set2P=function(p1,p2){
		if(!isPoint(p1) || !isPoint(p2) || isSamePoint(p1,p2)) return undefined;
		this.defined="2p";
		this.p1=new CHIpoint('define_point1_of_'+ this.id);
		this.p1.set(p1);
		this.p2=new CHIpoint('define_point2_of_'+ this.id);
		this.p2.set(p2);
		var y1=this.p1.y,y2=this.p2.y,x1=this.p1.x,x2=this.p2.x;
		if(x1==x2)
		{//竖直线：x=C
			this.k=this.h=undefined;
			this.a=1;
			this.b=0;
			this.c=x1*-1;
		}
		else if(y1==y2)
		{//水平线：y=C
			this.k=0;
			this.h=y1;
			this.a=0;
			this.b=1;
			this.c=y1*-1;
		}
		else
		{
			this.k=(y1-y2)/(x1-x2);
			this.h=(x2*y1-x1*y2)/(x2-x1);
			this.a=this.k;
			this.b=-1;
			this.c=this.h;
		}
		if(this.a<0){this.a*=-1;this.b*=-1;this.c*=-1;}
		this.t=this.theta=(x1==x2)?Math.PI/2:Math.atan(this.k);
	}
	this.setPK=function(p,k){
		if(!isPoint(p))return undefined;
		this.defined="pk";
		this.p=new CHIpoint('define_point_of_'+ this.id);
		this.p.set(p);
		if(k==undefined)
		{//不设参数k，则按竖直线处理
			this.k=this.h=undefined;
			this.a=1;
			this.b=0;
			this.c=this.p.x * -1;
			this.t=this.theta=Math.PI/2;
		}
		else
		{
			this.k=k;
			this.h=this.p.y - k * this.p.x;
			this.a=this.k;
			this.b=-1;
			this.c=this.h;
			this.t=this.theta=Math.atan(this.k);
		}
	}
	this.formula=function(type){
		if(type)type=type.toLowerCase();
		if(!type || type=="abc")
		{
			var sa=this.a?(this.a+"*x"):"";
			var sb=this.b?((this.b>0?(sa?"+":""):"")+this.b+"*y"):"";
			var sc=this.c?((this.c>0?"+":"")+this.c):"";
			return sa+sb+sc+"=0";
		}
		else if(type=="kh") return "y="+this.k+"*x"+(this.h>0?"+"+this.h:(this.h==0)?"":this.h);
	}
	this.getY=function(x){
		if(!this.a) return -1*this.c/this.b;
		else if(!this.b) return undefined;
		return this.k * x + this.h;
	}
	this.getX=function(y){
		if(!this.a) return undefined;
		else if(!this.b) return -1*this.c/this.a;
		return (y-this.h)/this.k;
	}
	this.getPoint=function(x,y){
		if(y==undefined) return {x:x,y:this.getY(x)};
		else if(x==undefined || x==='') return {x:this.getX(y),y:y};
		else return this.hasPoint({x:x,y:y})?{x:x,y:y}:undefined;
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.y==this.k * pt.x + this.h;
	}
	this.quadrants=this.pass=function(){
		var s;
		if(this.a==0)
		{
			if(this.h>0) s='1,2';
			else if(this.h<0) s='3,4';
			else s='x';
		}
		else if(this.b==0)
		{
			if(this.c>0) s='1,4';
			else if(this.c<0) s='2,3';
			else s='y';
		}
		else
		{
			if(this.h>0) s=this.k>0?'1,2,3':'1,2,4';
			else if(this.h<0) s=this.k>0?'1,3,4':'2,3,4';
			else s=this.k>0?'1,3':'2,4';
		}
		return s;
	}
	this.relate=function(shape){
		if(!isShape(shape))return undefined;
		var r;
		switch(shape.shape)
		{
			case "LINE":
				if(this.k==shape.k)
				{
					if(this.h==shape.h) r='CONINCIDE';
					else r='PARALLEL';
				} else r='INTERSECT';
				break;
			case "PARABOLA":
				var d=Math.pow(shape.b - this.k , 2)-4 * shape.a *(shape.c - this.h);
				if(d>0) r='INTERSECT';
				else if(d<0) r='SEPARAT';
				else r='TANGENT';
				break;
			case "CIRCLE":
				if(this.b)
				{
					var a=shape.a,b=shape.b,r=shape.r,k=this.k,h=this.h;
					var A=k*k + 1,
						B=2*k *(h-b) - 2*a,
						C=(h-b)*(h-b) - r*r + a*a,
						d=B*B - 4*A*C
					;
					if(d>0) r='INTERSECT';
					else if(d<0) r='SEPARATE';
					else r='TANGENT';
				}
				else
				{
					var x=-1*this.c/this.a,
						d=Math.abs(x-shape.a),
						rad=shape.r
					;
					if(d>rad) r='SEPARATE';
					else if(x==rad) r='TANGENT';
					else r='INTERSECT'
				}
				break;
		}
		return r;
	}
	this.intersect=function(shape){
		if(!isShape(shape))return undefined;
		var r;
		switch(shape.shape)
		{
			case "LINE":
				if(this.k!=shape.k)
				{
					var o1={
						a:this.a
						,b:this.b
						,c:this.c
					},o2={
						a:shape.a
						,b:shape.b
						,c:shape.c
					};
					r=Equation21(o1,o2);
				}
				break;
			case "PARABOLA":
				var o={
					a:this.b * shape.a
					,b:this.a + this.b * shape.b
					,c:this.b * shape.c + this.c
				}
				var x=Equation12(o);
				if(typeof x !='object') r={x:x,y:this.getY(x)}
				else r=[
					{x:x[0],y:this.getY(x[0])}
					,{x:x[1],y:this.getY(x[1])}
				];
				break;
			case "CIRCLE":
				if(this.k)
				{
					var a=shape.a,b=shape.b,r=shape.r,k=this.k,h=this.h;
					var o={
						a:1 + k*k
						,b:2*k *(h-b) - 2*a
						,c:(h-b)*(h-b) - r*r + a*a
					};
					var x=Equation12(o);
					if(typeof x!='object') r={x:x,y:this.getY(x)};
					else r=[
						{x:x[0],y:this.getY(x[0])}
						,{x:x[1],y:this.getY(x[1])}
					];
				}
				else
				{
					var x=this.c/this.a * -1;
					var y=shape.getY(x);
					if(y==undefined);
					else if(typeof y !='object') r={x:x,y:y};
					else r=[{x:x,y:y[0]},{x:x,y:y[1]}];
				}
				break;
		}
		return r;
	}
	this.angle=function(line){
		if(!(line instanceof CHIshape) || line.shape!="LINE")return undefined;
		return this.t-line.t;
	}
}
CHIline.prototype=new CHIshape();
/*
抛物线，竖直方向
.id					ID
.shape="PARABOLA"	(Const)形状名称
标准方程 y=ax^2+bx+c
.a					(Number)标准方程，二次项系数
.b					(Number)标准方程，一次项系数
.c					(Number)标准方程，常数项
.direction			(String)只会为up或down，图象开口朝向
.ep					(Point)极点值
.extreme			ep属性的别名
.setABC(a,b,c)		设置标准方程
--------------------
.set3P(p1,p2,p3)	通过不共线三点设置方程，使用本方法会生成以下三个属性
.p1	.p2	.p3			(Point)三点方程的三个定义点
--------------------
.d					(Number)判别式Δ=b^2-4ac
.delta				d属性的全名，根据d值可能会有以下一个属性
.root				(Number/Array[Number])数值或数组，图象与x轴的焦点值，只有一个时是Number，有两个时是Array[Number]
--------------------
.formula			(String)返回标准方程
.getX(y)			(Number/Array[Number]/undefine)根据y值计算x值，只有一个时返回Number，有两个时返回Array[Number]，没有返回undefined
.getY(x)			(Number)根据x值计算y值
.getPoint(x,y)		({x:x,y:y}/Array[{x:x,y:y}]/undefined)当双参全有时，如果此点在图象上则返回此点，如果不在返回undefined；
					如果双参缺一，则计算另一值，只有一点时返回{x:x,y:y}，有两点时返回Array[{x:x,y:y}]
.hasPoint(p)		(Boolean/undefined)返回点是否在图象上
*/
function CHIparabola(id)
{
	this.id="CHIparabola_"+id;
	this.shape="PARABOLA";
	//标准方程
	this.setABC=function(a,b,c){
		this.defined="abc";
		if(!a) return undefined;
		this.a=a;
		this.b=b;
		this.c=c;
		this.calculate();
	}
	this.set3P=function(p1,p2,p3){
		this.defined="3P";
		var r=isLine3P(p1,p2,p3);
		if(r || r==undefined)return undefined;
		this.p1=new CHIpoint('define_point1_of_'+ this.id);
		this.p1.set(p1);
		this.p2=new CHIpoint('define_point2_of_'+ this.id);
		this.p2.set(p2);
		this.p3=new CHIpoint('define_point3_of_'+ this.id);
		this.p3.set(p3);
		var o1={
			a:this.p1.x * this.p1.x
			,b:this.p1.x
			,c:1
			,d:this.p1.y * -1
		},o2={
			a:this.p2.x * this.p2.x
			,b:this.p2.x
			,c:1
			,d:this.p2.y * -1
		},o3={
			a:this.p3.x * this.p3.x
			,b:this.p3.x
			,c:1
			,d:this.p3.y * -1
		};
		r=Equation31(o1,o2,o3);
		this.a=r.x;
		this.b=r.y;
		this.c=r.z;
		this.calculate();
	}
	this.calculate=function(){
		this.direction=this.a>0?"up":"down";
		this.delta=this.d= this.b * this.b - 4 * this.a * this.c;
		//极值点
		this.ep=this.extreme=new CHIpoint("extreme_point_of_"+this.id);
		var epx=-0.5* this.b / this.a
			,epy=-0.25 * this.d / this.a;
		this.ep.setXY(epx,epy);
		this.extreme.setXY(epx,epy);
		if(this.d>=0)
		{
			if(this.d)
			{
				var rd=Math.sqrt(this.d);
				var x1=-0.5*( this.b + rd )/ this.a;
				var x2=-0.5*( this.b - rd )/ this.a;
				this.root=[x1,x2];
			}
			else this.root=-0.5* this.b / this.a;
		}
	}
	this.formula=function(){
		var sa,sb,sc;
		sa=this.a?(this.a+"*x*x"):"";
		sb=this.b?((this.b>0?'+':'')+this.b+'*x'):"";
		sc=this.c?((this.c>0?'+':'')+this.c):"";
		return "y="+sa+sb+sc;
	}
	this.getY=function(x){return this.a * x * x + this.b *x + this.c;}
	this.getX=function(y){
		var d=this.b * this.b - 4*this.a *(this.c-y);
		if(d<0)return undefined;
		else if(d==0) return this.ep.x;
		else
		{
			var x1,x2
			x1=(-1*this.b + Math.sqrt(d))/ this.a*0.5;
			x2=(-1*this.b - Math.sqrt(d))/ this.a*0.5;
			return [x1,x2];
		}
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var p=new CHIpoint('temp_point');
		return p.y==this.a * p.x * p.x + this.b * p.x + this.c;
	}
	this.getPoint=function(x,y){
		if(y==undefined) return {x:x,y:this.getY(x)};
		else if(x==undefined)
		{
			var x=this.getX(y);
			if(typeof x != 'object') return {x:x,y:y};
			else return [{x:x[0],y:y},{x:x[1],y:y}];
		}
		else return this.hasPoint({x:x,y:y})?{x:x,y:y}:undefined;
	}
}
CHIparabola.prototype=new CHIshape();
/*
圆类
.id					ID
.shape="CIRCLE"		(Const)形状名称
标准方程 (x-a)^2 + (y-b)^2 = r^2
.cp					(Point)圆心点
.center				cp属性的别名
.a					(Number)标准方程，圆心x坐标
.b					(Number)标准方程，圆心y坐标
.r					(Number)标准方程，圆半径
.radius				r属性的别名
一般方程 x^2 + y^2 + Dx + Ey + F = 0
.d					(Number)一般方程，x系数
.e					(Number)一般方程，y系数
.f					(Number)一般方程，常数项
--------------------
.set2P(p1,p2)		(Void/undefined)端点式定义圆，使用本方法会生成以下两个属性
.p1		.p2			(Point)定义圆的两个端点
--------------------
.set3P(p1,p2,p3)	(Void/undefined)不共线三点建立圆，使用本方法会生成以下三个属性
.p1		.p2		.p3	(Point)定义圆的三个不共线的点
--------------------
.getX(y)			(Number/Array[Number]/undefined)通过y坐标获取x坐标
.getY(x)			(Number/Array[Number]/undefined)通过x坐标获取y坐标
参数方程	x = a + r * cos(T); y = b + r * sin(T)
.getPoint(angle)	(Point)通过参数方程获取一点
.getTheta(p)		(NumberRadian)返回圆上一点与圆心的边线，与x正方向的夹角
.hasPoint(p)		(Boolean/undefined)返回点是否在圆上
.relate(shape)		(StringEnum)暂时只判定点与圆的位置，返回IN/ON/OUT
.tangent(p)			(Line/Array[Line])求过一点圆的切线方程，圆上有一条，圆外有两条
.formula(type)		(String)返回圆的方程，默认为def，返回一般方程；可以为ro，返回标准方程
*/
function CHIcircle(id)
{
	this.id="CHIcircle_"+id;
	this.shape="CIRCLE";
	this.cp=new CHIpoint("center_point_of_"+this.id);
	this.center=this.cp;
	this.setRO=function(r,o){
		this.defined="ro";
		if(!isPoint(o) || !r)return undefined;
		this.r=this.radius=r;
		this.cp.set(o);
		this.center.set(o);
		this.a=this.cp.x;
		this.b=this.cp.y;
		this.d=-2 * this.a;
		this.e=-2 * this.b;
		this.f=this.a * this.a + this.b * this.b - r*r;
	}
	this.setDEF=function(d,e,f){
		this.defined="def";
		var delta=(d*d + e*e - 4*f)/4;
		if(delta<0) return undefined;
		if(delta==0)
		{
			var o=new CHIpoint(id);
			o.setXY(-0.5*d,-0.5*e);
			return o;
		}
		this.radius=this.r=Math.sqrt(delta);
		this.a=-0.5*d;
		this.b=-0.5*e;
		this.d=d;
		this.e=e;
		this.f=f;
		this.cp.setXY(this.a,this.b);
		this.center.setXY(this.a,this.b);
	}
	this.set2P=function(p1,p2){
		this.defined="2P";
		if(!isPoint(p1) || !isPoint(p2) || isSamePoint(p1,p2)) return undefined;
		this.p1=new CHIpoint('define_point1_of_'+ this.id);
		this.p2=new CHIpoint('define_point2_of_'+ this.id);
		this.p1.set(p1);
		this.p2.set(p2);
		this.cp.setXY((this.p1.x+this.p2.x)*0.5,(this.p1.y+this.p2.y)*0.5);
		this.radius=this.r=distance(p1,p2)/2;
		this.d=-1*(this.p1.x+this.p2.x);
		this.e=-1*(this.p1.y+this.p2.y);
		this.f=this.p1.x * this.p2.x + this.p1.y * this.p2.y;
		this.a=-0.5*this.d;
		this.b=-0.5*this.e;
	}
	this.set3P=function(p1,p2,p3){
		this.defined="3P";
		var r=isLine3P(p1,p2,p3);
		this.p1=new CHIpoint('define_point1_of_'+ this.id);
		this.p2=new CHIpoint('define_point2_of_'+ this.id);
		this.p3=new CHIpoint('define_point3_of_'+ this.id);
		if(r==undefined || r)return undefined;
		var o1={
			a:this.p1.x
			,b:this.p1.y
			,c:1
			,d:this.p1.x * this.p1.x + this.p1.y * this.p1.y
		},o2={
			a:this.p2.x
			,b:this.p2.y
			,c:1
			,d:this.p2.x * this.p2.x + this.p2.y * this.p2.y
		},o3={
			a:this.p3.x
			,b:this.p3.y
			,c:1
			,d:this.p3.x * this.p3.x + this.p3.y * this.p3.y
		};
		r=Equation31(o1,o2,o3);
		if(r==undefined)return undefined;
		this.d=r.x;
		this.e=r.y;
		this.f=r.z;
		this.a=-0.5*this.d;
		this.b=-0.5*this.e;
		this.r=this.radius= Math.sqrt(this.a * this.a + this.b * this.b - this.f);
	}
	this.getX=function(y){
		var o={
			a:1
			,b:this.d
			,c:y*y + this.e * y + this.f
		};
		return Equation12(o);
	}
	this.getY=function(x){
		var o={
			a:1
			,b:this.e
			,c:x*x + this.d * x + this.f
		};
		return Equation12(o);
	}
	this.getPoint=function(angle){
		var pi=Math.PI,t=angle * pi/180;
		return {
			y:this.b + this.r * Math.sin(t)
			,x:this.a + this.r * Math.cos(t)
		};
	}
	this.getTheta=function(p){
		if(!isPoint(p) || !this.hasPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		var x=pt.x,y=pt.y,a=this.a,b=this.b,pi=Math.PI;
		if(x==a)return (y>b)? pi*0.5 : pi*1.5;
		if(y==b)return (x>a)? 0 : pi;
		var v//修正值
		if(x>a && y>b) v=0;
		else if(x>a) v=2 * pi;
		else if(y>b) v=pi;
		else v=pi;
		return Math.atan((pt.y - this.b)/(pt.x - this.a)) + v;
	}
	this.getAngle=function(p1,p2){
		if(!isPoint(p1) || !isPoint(p2) || !this.hasPoint(p1) || !this.hasPoint(p2))return undefined;
		return Math.abs(this.getTheta(p1) - this.getTheta(p2));
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		return this.cp.distance(p)==this.r;
	}
	this.relate=function(shape){
		if(!isPoint(shape) && !(shape instanceof CHIshape)) return undefined;
		var r;
		switch(shape.shape)
		{
			case "POINT":
				var d=this.cp.distance(p)-this.r;
				if(!d) r="ON";
				else if(d>0) r="SEPARAT";
				else r="IN";
				break;
		}
		return r;
	}
	this.tangent=function(p){
		if(!isPoint(p))return undefined;
		if(this.hasPoint(p))
		{//过圆上一点的切线方程
			var l=new CHIline('tangent_of_'+ this.id);
			l.setABC(p.x,p.y,-1*this.r*this.r);
			return l;
		}
		//过圆外一点的切线方程（有2条）
		var l=new CHIline('temp_line');
		l.set2P(this.cp,p);
		var t=l.t;
		var pi=Math.PI;
		var l1=new CHIline('tangent1_of_'+ this.id),l2=new CHIline('tangent2_of_'+ this.id);
		var dt=Math.asin(this.r/this.cp.distance(p));
		function test(t)
		{
			var a=CHIt2a(t);
			while(t<0) t+=180;
			return t%180!=90;
		}
		if(test(t+dt)) l1.setPK(p,Math.tan(t+dt)); else l1.setPK(p);
		if(test(t-dt)) l2.setPK(p,Math.tan(t-dt)); else l2.setPK(p);
	}
	this.formula=function(type){
		if(type)type=type.toLowerCase();
		if(!type || type=="def")
		{
			var sd,se,sf;
			sd=this.d?((this.d>0?"+":"")+this.d+"*x"):"";
			se=this.e?((this.e>0?"+":"")+this.e+"*y"):"";
			sf=this.f?((this.f>0?"+":"")+this.f):"";
			return "x*x+y*y"+sd+se+sf+"=0";
		}
		else if(type=="ro")
		{
			var sa,sb,sign;
			if(this.a)
			{
				sign=this.a<0?"+":"";
				sa="(x"+ sign + (this.a*-1) +")";
				sa+="*"+sa;
			}
			else sa="x*x";
			if(this.b)
			{
				sign=this.b<0?"+":"";
				sb="(y"+ sign + (this.b*-1) +")";
				sb+="*"+sb;
			}
			else sb="y*y";
			return sa+'+'+sb+"="+this.r*this.r;
		}
		return undefined;
	}
}
CHIcircle.prototype=new CHIshape();
/*
椭圆
.id
.shape="ELLIPSE"
.defined
标准方程 x^2/a^2 + y^2/b^2 = 1 ，当a>b时，焦点在x轴上；反之在y轴上
.a	.b				(Number)长半轴或短半轴
.c					(Number)焦距的一半
.e					(Number)离心率，越大越扁且在(0,1)上
.setAB				(Void/undefined)设置标准方程
.getX(y)			(Number/undefined)通过y值获取x值
.getY(x)			(Number/undefined)通过x值获取y值
参数方程 x = a * cos(T) , y = b * sin(T)
.getPoint(angle)	(Point)使用参数方程获取一点
.hasPoint(p)		(Boolean/undefined)返回点是否在椭圆上
.tangent(p)			(Line/undefined)过椭圆上一点的切线方程
.onAxis()			(Char)返回焦点所在的轴线名
.formula()			(String)返回标准方程
*/
function CHIellipse(id)
{
	this.id="CHIellipse_"+id;
	this.shape="ELLIPSE";
	this.setAB=function(a,b){
		if(a==b || !a || !b)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
		this.c=Math.sqrt(Math.abs(a*a-b*b));
		this.e=this.c/a;
		this.f1=new CHIpoint("focus_point_of_"+this.id);
		this.f2=new CHIpoint("focus_point_of_"+this.id);
		if(this.a>this.b)
		{
			this.f1.setXY(this.c*-1,0);
			this.f2.setXY(this.c,0);
		}
		else
		{
			this.f1.setXY(0,this.c);
			this.f2.setXY(0,this.c*-1);
		}
	}
	this.getX=function(y){
		if(Math.abs(y)==Math.abs(this.b)) return 0;
		var x=this.a * Math.sqrt(1 - y*y/this.b/this.b);
		return [x,x*-1];
	}
	this.getY=function(x){
		if(Math.abs(x)==Math.abs(this.a)) return 0;
		var y=this.b * Math.sqrt(1 - x*x/this.a/this.a);
		return [y,y*-1];
	}
	this.getPoint=function(angle){
		var pi=Math.PI;
		return {
			y:this.b * Math.sin(angle * pi/180)
			,x:this.a * Math.cos(angle * pi/180)
		};
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		return p.x*p.x/this.a/this.a+p.y*p.y/this.b/this.b==1;
	}
	this.tangent=function(p){
		if(!this.hasPoint(p))return undefined;
		var l=new CHIline('tangent_of_'+this.id);
		l.setABC(p.x/this.a/this.a,p.y/this.b/this.b,-1);
		return l;
	}
	this.onAxis=function(){return this.a>this.b?"X":"Y";}
	this.formula=function(){
		return "x*x" + (this.a?("/"+this.a * this.a):"")
			+ "+y*y" + (this.b?("/"+this.b * this.b):"") +"=1";
	}
}
CHIellipse.prototype=new CHIshape();
/*
双曲线类
.id					ID
.shape="HYPERBOLA"	形状名称
.dir				(Char)方向，焦点所在轴线名称
.a					(Number)实轴的一半
.b					(Number)虚轴的一半
.c					(Number)焦距的一半
.e					离心率，e>1
.f1		.f2			(Point)焦点
标准方程
	焦点在x轴上	x^2/a^2 - y^2/b^2 = 1
	焦点在y轴上	y^2/a^2 - x^2/b^2 = 1
.setABdir(a,b,dir)	(Void/undefined)设置标准方程及焦点位置
.getX(y)			(Number/Array[Number])使用y值获取x值
.getY(x)			(Number/Array[Number])使用x值获取y值
参数方程 x = a * secT , y = b * tanT
.getPoint(angle)	(Point)用参数方程获取一点
.hasPoint(p)		(Boolean/undefined)返回点是否在双曲线上
.formula()			(String)返回标准方程
*/
function CHIhyperbola(id)
{
	this.id='CHIhyperbola_'+id;
	this.shape="HYPERBOLA";
	this.setABdir=function(a,b,dir){
		if(!a || !b)return undefined;
		this.defined="abdir";
		this.a=a;
		this.b=b;
		this.dir=dir=='x'?'x':'y';
		this.c=Math.sqrt(a*a+b*b);
		this.e=this.c/a;
		this.f1=new CHIpoint("focus_point_of_"+this.id);
		this.f2=new CHIpoint("focus_point_of_"+this.id,true);
		if(dir=='x')
		{
			this.f1.setXY(this.c*-1,0,true);
			this.f2.setXY(this.c,0);
		}
		else
		{
			this.f1.setXY(0,this.c);
			this.f2.setXY(0,this.c*-1);
		}
	}
	this.getX=function(y){
		if(this.dir=='x') var x=Math.sqrt(1 + y*y/this.b/this.b) * this.a;
		else if(Math.abs(y)<Math.abs(this.a))return undefined;
		else var x=Math.sqrt(y*y/this.a/this.a - 1) * this.b;
		return x?[x,x*-1]:0;
	}
	this.getY=function(x){
		if(this.dir=='y') var y=Math.sqrt(1 + x*x/this.b/this.b) * this.a;
		else if(Math.abs(x)<Math.abs(this.a))return undefined;
		else var y=Math.sqrt(x*x/this.a/this.a - 1) * this.b;
		return y?[y,y*-1]:0;
	}
	this.getPoint=function(angle){
		var pi=Math.PI;
		var cosA=Math.cos(angle * pi/180);
		if(!cosA)return undefined;
		var v1=this.a / cosA,
			v2=this.b * Math.tan(angle * pi/180);
		return this.dir=='x'?{x:v1,y:v2}:{x:v2,y:v1};
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		return this.dir=='x'?
			p.x*p.x/this.a/this.a-p.y*p.y/this.b/this.b==1:
			p.y*p.y/this.a/this.a-p.x*p.x/this.b/this.b==1;
	}
	this.formula=function(){
		return this.dir=='x'?
		(
		  "x*x" + (this.a?("/"+this.a * this.a):"")
		+ "-y*y" + (this.b?("/"+this.b * this.b):"") +"=1"
		):(
		  "y*y" + (this.a?("/"+this.a * this.a):"")
		+ "-x*x" + (this.b?("/"+this.b * this.b):"") +"=1"
		);
	}
}
CHIhyperbola.prototype=new CHIshape();
/*
阿基米德螺旋线类，极坐标方程：r = a * Theta + b
.id					ID
.shape="SPIRAL"		形状名称
.defined			定义方式
.set(a,b)			(Void/undefined)设置公式参数
.getPoint(angle)	(Point)获取螺旋线上一点
.hasPoint(p)		(Boolean/undefined)返回点是否在曲线上
.formula()			(String)返回极坐标方程
*/
function CHIspiral(id)
{
	this.id='CHIspiral'+id;
	this.shape="SPIRAL";
	this.set=function(a,b){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
	}
	this.getPoint=function(angle){
		var t=Math.PI/180 * angle;
		var r=this.a * t + this.b;
		var p=new CHIpoint("temp_point_of_"+ this.id);
		p.setRT(r,t);
		return {x:p.x,y:p.y};
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.r==this.a * pt.t + this.b;
	}
	this.formula=function(){
		return "r="+ this.a + "*T" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIspiral.prototype=new CHIshape();
/*
绝对值曲线类 y = a * |x| + b
.id				ID
.shape="ABS"	图象名称
.defined		(String)定义方式
.set(a,b)		(Void)设置公式参数
.getX(y)		(Number/undefined)根据x值计算y值
.getY(x)		(Number/Array[Number]/undefined)根据y值计算x值
.getPoint(x,y)	(Point/undefined)根据x或y值返回点
.hasPoint(p)	(Boolean/undefined)返回点是否在图象上
.formula()		(String)返回公式
*/
function CHIabs(id)
{
	this.id='CHIabs'+id;
	this.shape="ABS";
	this.set=function(a,b){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
	}
	this.getX=function(y){
		var r;
		if(y==undefined);
		var x= (y - this.b)/this.a;
		if(x>0) r=[x , x*-1];
		if(!x) r=0;
		return r;
	}
	this.getY=function(x){return this.a * Math.abs(x) + this.b;}
	this.getPoint=function(x,y){
		if(y==undefined) return {x:x,y:this.getY(x)};
		if(x==='')
		{
			var x=this.getX(y);
			if(x!=undefined)
			{
				if(typeof x !='object') return {x:x,y:y};
				return [{x:x[0],y:y}  ,  {x:x[1],y:y}]
			}
			return undefined;
		}
		if(this.hasPoint({x:x,y:y})) return {x:x,y:y};
		return undefined;
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.y==this.a * Math.abs(pt.x) + this.b;
	}
	this.formula=function(){
		return "y="+ this.a + "* Math.abs(x)" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIabs.prototype=new CHIshape();
/*
正弦类 y=a * sin(T) + b
.id					ID
.shape="SIN"		图象名称
.defined			(String)定义方式
.set(a,b)			(Void/undefined)设置公式参数
.getY(x)			(Number/undefined)根据x值获取y值
.getPoint(x)		(Point/undefined)根据x值获取点
.hasPoint(p)		(Boolean/undefined)返回点是否在图象上
.formula()			(String)返回公式
*/
function CHIsin(id)
{
	this.id="CHIsin"+id;
	this.shape="SIN";
	this.set=function(a,b){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
	}
	this.getY=function(x){
		x=Math.PI * x / 180;
		return this.a * Math.sin(x) + this.b;
	}
	this.getPoint=function(x){
		return {x:x,y:this.getY(x)};
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.y==this.a * Math.sin(pt.x) + this.b;
	}
	this.formula=function(){
		return "y="+ this.a +" * Math.sin(x)" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIsin.prototype=new CHIshape();
/*
绝对值正弦类 y = a * |sin(x)| + b
.id					ID
.shape="SIN"		图象名称
.defined			(String)定义方式
.set(a,b)			(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
.hasPoint(p)		(Boolean/undefined)返回点是否在图象上
.formula()			(String)返回公式
*/
function CHIabsin(id)
{
	this.id="CHIabsin"+id;
	this.shape="ABSIN";
	this.set=function(a,b){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
	}
	this.getY=function(x){
		x=Math.PI * x / 180;
		return this.a * Math.abs(Math.sin(x)) + this.b;
	}
	this.getPoint=function(x){
		return {x:x,y:this.getY(x)};
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.y==this.a * Math.abs(Math.sin(pt.x)) + this.b;
	}
	this.formula=function(){
		return "y="+ this.a +" * Math.abs(Math.sin(x))" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIabsin.prototype=new CHIshape();
/*
水平心形线 r = a * (1 +/- cos(T)) + b（b越大越接近圆）
.id					ID
.dir				(String)方向，left时公式使用减法，right时公式使用加法
.shape="HEARTH"		图象名称
.defined			(String)定义方式
.set(a,b)			(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
.hasPoint(p)		(Boolean/undefined)返回点是否在图象上
.formula()			(String)返回公式
*/
function CHIheartH(id)
{
	this.id="CHIheartH"+id;
	this.shape="HEARTH";
	this.set=function(a,b,dir){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
		this.dir=dir;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var r= this.a * (1 + Math.cos(t) * (this.dir=='left'?-1:1)) + this.b;
		var p=new CHIpoint('temp_point');
		p.setRT(r,t);
		return p;
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.r==this.a * (1 + Math.cos(pt.t) * (this.dir=='left'?-1:1)) + this.b;
	}
	this.formula=function(){
		return "y="+ this.a +" * (1 "+ (this.dir=='left'?"-":"+") +" Math.cos(x))" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIheartH.prototype=new CHIshape();

/*
垂直心形线 r = a * (1 +/- sin(T)) + b（b越大越接近圆）
.id					ID
.dir				(String)方向，down时公式使用减法，up时公式使用加法
.shape="HEARTH"		图象名称
.defined			(String)定义方式
.set(a,b)			(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
.hasPoint(p)		(Boolean/undefined)返回点是否在图象上
.formula()			(String)返回公式
*/
function CHIheartV(id)
{
	this.id="CHIheartH"+id;
	this.shape="HEARTH";
	this.set=function(a,b,dir){
		if(!a)return undefined;
		this.defined="ab";
		this.a=a;
		this.b=b;
		this.dir=dir;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var r= this.a * (1 + Math.sin(t) * (this.dir=='down'?-1:1)) + this.b;
		var p=new CHIpoint('temp_point');
		p.setRT(r,t);
		return p;
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return undefined;
		var pt=new CHIpoint('temp_point');
		pt.set(p);
		return pt.r==this.a * (1 + Math.sin(pt.t) * (this.dir=='down'?-1:1)) + this.b;
	}
	this.formula=function(){
		return "y="+ this.a +" * (1 "+ (this.dir=='down'?"-":"+") +" Math.sin(x))" + (this.b?((this.b>0?'+':'')+this.b):'');
	}
}
CHIheartV.prototype=new CHIshape();
/*
摆线
x = a * (T - sin(T))
y = a * (1 - cos(T))
.id					ID
.shape="CYCLOID"	图象名称
.defined			(String)定义方式
.set(a)				(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
*/
function CHIcycloid(id)
{
	this.id="CHIcycloid"+id;
	this.shape="CYCLOID";
	this.set=function(a){
		if(!a)return undefined;
		this.defined="a";
		this.a=a;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.a * (t - Math.sin(t))
		var y= this.a * (1 - Math.cos(t))
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIcycloid.prototype=new CHIshape();
/*
迪卡尔叶形线
x = 3 * a * t / (1 + t^3)
y = 3 * a * t^2 / (1 + t^3)
t=tan(T)
.id					ID
.shape="FOLIUM"		图象名称
.defined			(String)定义方式
.set(a)				(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
*/
function CHIfolium(id)
{
	this.id="CHIfolium"+id;
	this.shape="FOLIUM";
	this.set=function(a){
		if(!a)return undefined;
		this.defined="a";
		this.a=a;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		t=Math.tan(t);
		var x= 3 * this.a * t / (1 + t*t*t);
		var y= 3 * this.a * t*t / (1 + t*t*t);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIfolium.prototype=new CHIshape();
/*
星形线
x = a * cos(T)^3
y = a * sin(T)^3
.id					ID
.shape="PARACYCLE"	图象名称
.defined			(String)定义方式
.set(a)				(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
*/
function CHIparacycle(id)
{
	this.id="CHIparacycle"+id;
	this.shape="PARACYCLE";
	this.set=function(a){
		if(!a)return undefined;
		this.defined="a";
		this.a=a;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.a * Math.pow(Math.cos(t),3);
		var y= this.a * Math.pow(Math.sin(t),3);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIparacycle.prototype=new CHIshape();
/*
玫瑰线
极坐标方程 r = a * cos(n*T) , r = a * sin(n*T)
参数方程
x= a * sin(nT) * cos(T)
y= a * sin(nT) * sin(T)
.id					ID
.shape="PARACYCLE"	图象名称
.defined			(String)定义方式
.set(a,n)			(Void/undefined)设置公式参数
	其中a决定花瓣大小，n为奇数时有n个花瓣，为偶数时有2n个花瓣
.getPoint(angle)	(Point/undefined)根据x值获取点
*/
function CHIrose(id)
{
	this.id="CHIrose"+id;
	this.shape="ROSE";
	this.set=function(a,n){
		if(!a || !n)return undefined;
		this.defined="an";
		this.a=a;
		this.n=n;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.a * Math.sin(this.n * t) * Math.cos(t);
		var y= this.a * Math.sin(this.n * t) * Math.sin(t);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIrose.prototype=new CHIshape();
/*
利萨如曲线 x = a * sin(p * T) , y = b * sin(q * T + F)
常用参数，F=0，a=b，p为奇数，且|p-q|=1
.id					ID
.shape="LISSA"		图象名称
.defined			(String)定义方式
.set(a,b,p,q,f)		(Void/undefined)设置公式参数
.getPoint(angle)	(Point/undefined)根据x值获取点
*/
function CHIlissa(id)
{
	this.id="CHIlissa"+id;
	this.shape="LISSA";
	this.set=function(a,b,p,q,f){
		if(!a || !b || !p || !q)return undefined;
		this.defined="abpqf";
		this.a=a;
		this.b=b;
		this.q=q;
		this.p=p;
		this.f=f;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.a * Math.sin(this.p * t);
		var y= this.b * Math.sin(this.q * t + this.f);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIlissa.prototype=new CHIshape();
/*
伯努利Bernoulli双纽线 r^2 = a^2 * sin(2T)
*/
function CHIBernoulli(){}

//经过拉伸变换的圆
function CHIcircle_skewed(id){
	this.id="CHIcircle_skewed_"+id;
	this.shape="CIRCLE_SKEWED";
	this.set=function(a,b,r){
		this.a=a;
		this.b=b;
		this.r=r;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.r * Math.cos(t) + this.b * this.r * Math.sin(t);
		var y= this.a * this.r * Math.cos(t) + this.r * Math.sin(t);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIcircle_skewed.prototype=new CHIshape();
//经过非等比缩放的圆
function CHIcircle_scaled(id){
	this.id="CHIcircle_scaled_"+id;
	this.shape="CIRCLE_SCALED";
	this.set=function(a,b,r){
		this.a=a;
		this.b=b;
		this.r=r;
	}
	this.getPoint=function(angle){
		var t=Math.PI * angle/180;
		var x= this.a * this.r * Math.cos(t);
		var y= this.b * this.r * Math.sin(t);
		var p=new CHIpoint('temp_point');
		p.setXY(x,y);
		return p;
	}
}
CHIcircle_scaled.prototype=new CHIshape();
