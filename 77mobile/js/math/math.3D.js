// 三维直角坐标系
function CHIxyz(cX,cY)
{
	var o={};
	o.center=[float(cX),float(cY)];
	o.type="";//视图类型，可能要放正交/俯视/正视/侧视/一二三点透视等
	o.map=function(p){//根据类型，将三维坐标映射到屏幕坐标系中
	}
	return o;
}
//三维坐标点
function CHIpoint3D()
{
	if(arguments.length<1)return undefined;
	var arg=arguments,o={};
	if(isArg(arg[0]))arg=arg[0];
	function calRPT(){//已知xyz，计算rtp
		 o.r=module(o.x,o.y,o.z);
		 o.t=acos(o.z/o.r);
		 o.p=atan(o.y/o.x);
	}
	function calXYZ(){//已知rtp，计算xyz
		var r=o.r,t=o.t,p=o.p;
		o.x=r * sin(t) * cos(p);
		o.y=r * sin(t) * sin(p);
		o.z=r * cos(t);
	}
	
	if(isArr(arg[0]))//如果是数组，需要有3个元素，认定为xyz
	{
		arg=arg[0];
		if(arg.length<3)return undefined;
		o.x=float(arg[0]);
		o.y=float(arg[1]);
		o.z=float(arg[2]);
		calRPT();
	}
	else if(isObj(arg[0]))
	{
		arg=arg[0];
		if("x" in arg && "y" in arg && "z" in arg)
		{
			o.x=float(arg.x);
			o.y=float(arg.y);
			o.z=float(arg.z);
			calRPT();
		}
		else if("r" in arg && "t" in arg && "p" in arg)
		{
			o.r=float(arg.r);
			o.t=float(arg.t);
			o.p=float(arg.p);
			calXYZ();
		}
		else return undefined;
	}
	else if(arg.length>=3)
	{
		o.x=float(arg[0]);
		o.y=float(arg[1]);
		o.z=float(arg[2]);
		calRPT();
	}
	else return undefined;
	
	o.toString=function(type){//默认返回xyz坐标；当type=rtp时返回极坐标
		return type && type.toLowerCase()=='rtp' ?
			fix(o.r) +','+ fix(o.t) +','+ fix(o.p):
			fix(o.x) +','+ fix(o.y) +','+ fix(o.z);
	}
	o.middle=o.center=function(p){
		if(!isPoint3D(p))return undefined;
		var pt=CHIpoint3D(p);
		return CHIpoint3D((pt.x+o.x)/2, (pt.y+o.y)/2, (pt.z+o.z)/2);
	}
	o.equal=function(){//判断相等的点，忽略精度误差
		var np=CHIpoint3D(arguments);
		return fix(np.x)==fix(o.x) && fix(np.y)==fix(o.y) && fix(np.z)==fix(o.z);
	}
	o.distance=function(P_L_P){//点到点/直线/平面的距离
		if(isPoint3D(P_L_P))
		{//两点距离
			var p=CHIpoint3D(P_L_P);
			return module(o.x-p.x, o.y-p.y, o.z-p.z);
		}
		else if(isLine3D(P_L_P))
		{//点到直线距离
			var p=P_L_P.getPoint(),//在直线上任取一点
				v=CHIvector3D(o,p),//本点与任意点构造向量
				dv=P_L_P.dv,//直线的方向向量
				t=v.theta(dv);
			if(t>PI/2) t=PI-t;
			return abs(v.m * sin(t));
		}
		else if(isPlane(P_L_P))
		{//点到平面距离
			var nv=P_L_P.nv,//平面的法向量
				p=P_L_P.getPoint(),//平面一点
				v=CHIvector3D(o,p);//本点与任意点的向量
			return abs(v.inner(nv)/nv.m);
		}
		return undefined;
	}
	o.on=function(L_P){//点是否在直线或平面上
		return isLine3D(L_P) || isPlane(L_P) ? L_P.hasPoint(o) : undefined;
	}
	o.transform=function(mat){//矩阵变换，参数必须使用CHImatrix对象的实例，且必须是4*4的矩阵
		if(!checkMatrix || !isMatrix(mat) || mat.row!=4 || mat.col!=4)return undefined;
		var me=CHImatrix(1,4);
		me.set(o.x,o.y,o.z,1);
		var r=me.pre(mat);
		if(r[0][3])
		{
			var x=r[0][3];
			r[0][0]/=x;
			r[0][1]/=x;
			r[0][2]/=x;
		}
		return CHIpoint3D(r[0]);
	}
	o.translate=function(x,y,z){//平移变换
		if(!checkMatrix)return false;
		if(!y)y=0;
		if(!z)z=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			float(x),float(y),float(z),1
		);
		return o.transform(mat);
	}
	o.scale=function(x,y,z,p){//缩放变换，第四参可以是一个"点"
		if(!checkMatrix)return false;
		if(y===undefined)y=x;
		if(z===undefined)z=x;
		var mat=CHImatrix(4,4);
		x=float(x);y=float(y);z=float(z);
		if(isPoint3D(p))
		{
			var pt=CHIpoint3D(p),px=pt.x,py=pt.y,pz=pt.z;
			mat.set(
				x,0,0,0,
				0,y,0,0,
				0,0,z,0,
				(1-x)*px,(1-y)*py,(1-z)*pz,1
			);
		}
		else mat.set(
			x,0,0,0,
			0,y,0,0,
			0,0,z,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.rotateX=function(a){//绕X轴旋转
		var t=a2t(a),ct=cos(t),st=sin(t);
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,ct,st,0,
			0,-st,ct,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.rotateY=function(a){//绕Y轴旋转
		var t=a2t(a),ct=cos(t),st=sin(t);
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			ct,0,-st,0,
			0,1,0,0,
			st,0,ct,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.rotateZ=function(a){//绕Z轴旋转
		var t=a2t(a),ct=cos(t),st=sin(t);
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			ct,st,0,0,
			-st,ct,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewXY=function(d){//沿X轴含Y轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			float(d),1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewXZ=function(d){//沿X轴含Z轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,1,0,0,
			float(d),0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewYX=function(d){//沿Y轴含X轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,float(d),0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewYZ=function(d){//沿Y轴含Z轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,1,0,0,
			0,float(d),1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewZX=function(d){//沿Z轴含X轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,float(d),0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.skewZY=function(d){//沿Z轴含Y轴错切
		if(!checkMatrix)return false;
		if(!d)d=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,1,float(d),0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flip=o.reflect=function(){//关于原点反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			-1,0,0,0,
			0,-1,0,0,
			0,0,-1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipX=o.reflectX=function(){//关于X轴反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,-1,0,0,
			0,0,-1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipY=o.reflectY=function(){//关于Y轴反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			-1,0,0,0,
			0,1,0,0,
			0,0,-1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipZ=o.reflectZ=function(){//关于Z轴反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			-1,0,0,0,
			0,-1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipXY=o.reflectXY=function(){//关于XOY平面反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,1,0,0,
			0,0,-1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipXZ=o.reflectXZ=function(){//关于XOZ平面反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,-1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.flipYZ=o.reflectYZ=function(){//关于YOZ平面反射
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			-1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.frontView=o.projXOZ=function(){//正视图，在XOZ平面上的正投影
		if(!checkMatrix)return false;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,0,0,0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.sideView=o.projYOZ=function(l){//侧视图，在YOZ平面上的正投影，l是偏移，默认为0
		if(!checkMatrix)return false;
		if(!l || isNaN(l))l=0;
		var mat=CHImatrix(4,4);
		mat.set(
			0,0,0,0,
			-1,0,0,0,
			0,0,1,0,
			-l,0,0,1
		);
		return o.transform(mat);
	}
	o.topView=o.projXOY=function(l){//俯视图，在XOY平面上的正投影，l是偏移，默认为0
		if(!checkMatrix)return false;
		if(!l || isNaN(l))l=0;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,0,-1,0,
			0,0,0,0,
			0,0,-l,1
		);
		return o.transform(mat);
	}
	/*
	正轴测投影 Normal axonometric projection
	先绕Z轴旋转theta角，再绕X轴旋转负phi角，再做XOZ面投影
	
	正轴测投影变换的轴向变形系数
	Hx=sqrt((cosT)^2+(sinT*sinP)^2);
	Hy=sqrt((sinT)^2+(cosT*sinP)^2);
	Hz=cosT;
	
	当Hx=Hy=Hz时，叫正等轴测投影，T=45度，P=35度16分
	当Hx=2Hy=Hz时，叫正二轴测投影，T=20度42分，P=19度28分，默认模式
	*/
	o.projNA=function(para){
		if(!checkMatrix)return false;
		if(!para)para={};
		var t="theta" in para ? float(para.theta) : a2t(20.7);
		var p="phi" in para ? float(para.phi) : a2t(19.5);
		var mat=CHImatrix(4,4),ct=cos(t),st=sin(t),cp=cos(p),sp=sin(p);
		mat.set(
			ct,0,-st*sp,0,
			-st,0,-ct*sp,0,
			0,0,cp,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	/*
	斜轴测投影 Oblique axonometric projection
	先沿X轴含Y轴错切，再沿Z轴含Y轴错切，再做XOZ面投影
	
	斜轴测投影变换的轴向变形系数
	Hx=Hz=1
	Hy=sqrt(skewXY,skewZY);
	
	斜二轴测投影，skewXY=skewZY=±0.354，立体几何用的坐标系应该是这个，默认模式是skewXY=-0.354,skewZY=0.354
	*/
	o.projOA=function(para){
		if(!checkMatrix)return false;
		if(!para)para={};
		var skewXY='skewXY' in para ? para.skewXY : -0.354;
		var skewZY='skewZY' in para ? para.skewZY : 0.354;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			float(skewXY),0,float(skewZY),0,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	/*点在任意平面上的投影*/
	o.proj=o.projection=function(p){
		if(!isPlane(p))return undefined;
		var v=p.nv,x=v.x,y=v.y,z=v.z;
		var mat=CHImatrix(4,4);
		mat.set(
			1-x*x,	-x*y,	-x*z,	0,
			-x*y,	1-y*y,	-y*z,	0,
			-x*z,	-y*z,	1-z*z,	0,
			0,0,0,1
		);
		return o.transform(mat);
/////////////////////////////////下边的是我自己写的几何算法
//		if(!p.hasPoint(o))
//		{
//			var pt=p.getPoint()//任取平面上一点
//				,v=CHIvector3D(pt,o)//任意点与本点的向量
//				,nv=p.nv//平面法向量
//				,h=v.inner(nv)/nv.m//点到平面的距离
//				,vh=CHIvector3D(h,nv)//模长及方向构造向量
//				,h1=vh.end(o)//当平面法向量与点到投影向量同向时
//				,h2=vn.start(o)//当平面法向量与点到投影向量反向时
//			return p.hasPoint(h1) ? h1 : h2;//返回平面拥有的那个点
//		}
//		return CHIpoint3D(o);
/////////////////////////////////上边的是我自己写的几何算法
	}
	/*
	文库上的教程写，在（一二三点）透视投影之前一般先做平移，暂时不知道原理
	
	一点透视投影 one point perspective projection
	先进行透视变换，再做XOZ平面投影
	q是灭点到投影面垂直距离的倒数，一般取q<0，灭点位于物体外侧，符合人们视觉习惯
	默认q=-0.002
	*/
	o.pers1=o.perspectiveOne=function(para){
		if(!checkMatrix)return false;
		if(!para)para={};
		var q=para.q ? para.q : -0.002;
		var mat=CHImatrix(4,4);
		mat.set(
			1,0,0,0,
			0,0,0,float(q),
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	/*
	两点透视投影 two point perspective projection
	先绕Z轴旋转theta，再做一点透视，默认45度
	*/
	o.pers2=o.perspectiveTwo=function(para){
		if(!checkMatrix)return false;
		if(!para)para={};
		var q=para.q ? float(para.q) : -0.002;
		var t='theta' in para ? float(para.theta) : a2t(45);
		var mat=CHImatrix(4,4),st=sin(t),ct=cos(t);
		mat.set(
			ct,0,0,q*st,
			-st,0,0,q*ct,
			0,0,1,0,
			0,0,0,1
		);
		return o.transform(mat);
	}
	/*
	三点透视投影 three point perspective projection
	先绕Z轴旋转theta，再绕X轴旋转phi，再做一点透视，默认theta=45度，phi=-30度
	*/
	o.pers3=o.perspectiveThree=function(para){
		if(!checkMatrix)return false;
		if(!para)para={};
		var q=para.q ? float(para.q) : -0.002;
		var t='theta' in para ? float(para.theta) : a2t(45);
		var p='phi' in para ? float(para.phi) : a2t(-30);
		var mat=CHImatrix(4,4),st=sin(t),ct=cos(t),sp=sin(p),cp=cos(p);
		mat.set(
			ct,0,st*cp,q*st*cp,
			-st,0,ct*sp,q*ct*sp,
			0,0,cp,-q*sp,
			0,0,0,1
		);
		return o.transform(mat);
	}
	o.constructor=CHIpoint3D;
	return o;
}
/*
三维坐标系中的点
	1.有三个元素的数组
	2.有xyz属性的对象
	3.有rtp属性的对象
	4.不是CHIvector3D类的实例
*/
isPoint3D=function(o){
	return isArr(o) && o.length>=3
		|| isObj(o) && ( 
			'x' in o && 'y' in o && 'z' in o
			|| 'r' in o && 't' in o && 'p' in o
	) && o.constructor!=CHIvector3D
}

//三维向量
function CHIvector3D()
{
	if(arguments.length<1)return undefined;
	var arg=arguments,o={};
	if(isArg(arg[0])) arg=arg[0];
	
	function calRPT(){//已知xyz，计算rtp
		 o.r=module(o.x,o.y,o.z);
		 o.t=o.theta=acos(o.z/o.r);
		 o.p=o.phi=atan(o.y/o.x);
	}
	function calXYZ(){//已知rtp，计算xyz
		var r=o.r,t=o.t,p=o.p;
		o.x=r * sin(t) * cos(p);
		o.y=r * sin(t) * sin(p);
		o.z=r * cos(t);
	}
	function setPP(p1,p2){//两点构造向量
		var pS=CHIpoint3D(p1),pE=CHIpoint3D(p2);
		o.x=pS.x-pE.x;
		o.y=pS.y-pE.y;
		o.z=pS.z-pE.z;
		calRPT();
	}
	
	if(arg.length==1)
	{//一个参数，可以是数组，或点/向量对象
		arg=arg[0];
		if(isArr(arg))//如果参数是至少有3个元素的数组，则按xyz计算
		{
			if(arg.length<3)return undefined;
			o.x=float(arg[0]);
			o.y=float(arg[1]);
			o.z=float(arg[2]);
			calRPT();
		}
		else if('x' in arg && 'y' in arg && 'z' in arg)
		{
			o.x=float(arg.x);
			o.y=float(arg.y);
			o.z=float(arg.z);
			calRPT();
		}
		else if('r' in arg && 't' in arg && 'p' in arg)
		{
			o.r=float(arg.r);
			o.t=float(arg.t);
			o.p=float(arg.p);
			calXYZ();
		}
		else return undefined;
	}
	else if(arg.length==2)
	{//两个参数
		var a=arg[0],b=arg[1];
		if(isPoint3D(a) && isPoint3D(b))
		{//两点构造向量
			setPP(a,b);
		}
		else if(isVector3D(a) && !isNaN(b) || isVector3D(b) && !isNaN(a))
		{//可以是同方向的向量及模长
			var v,m;
			if(isVector3D(a)){v=a; m=b;}
			else {v=b; m=a;}
			m=float(m)/v.m;
			o.x=v.x * m;
			o.y=v.y * m;
			o.z=v.z * m;
			calRPT();
		}
		else return undefined;
	}
	else if(arg.length>=3)
	{
		o.x=float(arg[0]);
		o.y=float(arg[1]);
		o.z=float(arg[2]);
		calRPT();
	}
	else return undefined;
	
	//用来简单判断向量方向的符号，当向量平行时可判断是否完全同向
	o.signal=(o.x>=0 ? (o.x>0 ? '+' : '0') : '-')
		+(o.y>=0 ? (o.y>0 ? '+' : '0') : '-')
		+(o.z>=0 ? (o.z>0 ? '+' : '0') : '-');
	o.m=o.module=module(o.x,o.y,o.z);
	o.cosAlpha=o.x/o.m;
	o.cosBeta=o.y/o.m;
	o.cosGamma=o.z/o.m;
	o.toString=function(type){//默认返回xyz坐标，当type=rtp时返回极坐标
		return type && type.toLowerCase()=='rtp' ?
			fix(o.r) +','+ fix(o.t) +','+ fix(o.p):
			fix(o.x) +','+ fix(o.y) +','+ fix(o.z);
	}
	//单位向量
	o.u=o.unit=function(){var m=o.m;return CHIvector3D(o.x/m,o.y/m,o.z/m);}
	//反向量
	o.neg=o.negative=function(){return CHIvector3D(-o.x,-o.y,-o.z);}
	o.add=o.plus=function(v){
		return isVector3D(v) ? CHIvector3D(o.x+v.x, o.y+v.y, o.z+v.z) : undefined;
	}
	o.minus=o.substract=function(v){
		return isVector3D(v) ? CHIvector3D(o.x-v.x, o.y-v.y, o.z-v.z) : undefined;
	}
	o.times=o.multi=o.multiple=function(c){
		c=float(c);
		return CHIvector3D(o.x*c,o.y*c,o.z*c);
	}
	o.inner=function(v){
		return isVector3D(v) ? o.x * v.x + o.y * v.y + o.z * v.z : undefined;
	}
	o.theta=function(v){
		return isVector3D(v) ? acos(o.inner(v)/o.m/v.m) : undefined;
	}
	o.angle=function(v){return t2a(o.theta(v));}
	o.str8=o.straight=o.right=function(v){
		return isVector3D(v) ? o.inner(v)===0 : undefined;
	}
	o.outer=function(v){
		if(!isVector3D(v))return undefined;
		var x=o.x,y=o.y,z=o.z,a=v.x,b=v.y,c=v.z;
		return CHIvector3D(y*c-z*b, z*a-x*c, x*b-y*a);
	}
	o.parallel=function(v){
		return isVector3D(v) ? o.outer(v)===0 : undefined;
	}
	o.start=function(pend){
		if(!isPoint3D(pend))return undefined;
		var p=CHIpoint3D(pend);
		return CHIpoint3D(p.x-o.x, p.y-o.y, p.z-o.z);
	}
	o.end=function(pstart){
		if(!isPoint3D(pstart))return undefined;
		var p=CHIpoint3D(pstart);
		return CHIpoint3D(p.x+o.x, p.y+o.y, p.z+o.z);
	}
	o.proj=o.projection=function(V_L_P){//本向量在某一向量/直线/平面上的分量，即射影
		var vd;
		if(isPlane(V_L_P))
		{//在平面上的射影，是本向量，与在法向量上射影的差
			vd=V_L_P.nv;
			return o.minus(o.proj(vd));
		}
		else if(isVector3D(V_L_P)) vd=V_L_P;
		else if(isLine3D(V_L_P)) vd=V_L_P.dv;
		else return undefined;
		return vd.times(o.inner(vd)/vd.m/vd.m);
	}
	o.translate=function(){}//向量平移仍然是自己
	//暂时三维向量不做平移之外的动作
	o.constructor=CHIvector3D;
	return o;
}
isVector3D=function(o){return o.constructor==CHIvector3D;}
/*三点共线，为两个拥有共同起点的向量平行*/
isOnSameLine3D=function(p1,p2,p3){
	if(!isPoint3D(p1) || !isPoint3D(p2) || !isPoint3D(p3))return undefined;
	var v1=CHIvector3D(p1,p2),v2=CHIvector3D(p1,p3);
	return v1.parallel(v2);
}

//空间直线
function CHIline3D()
{
	if(arguments.length<1)return undefined;
	var arg=arguments,o={};
	if(isArg(arg[0])) arg=arg[0];
	
	//对象是否有如下属性，返回拥有的属性名数组，可能返回空数组
	function has(o,attrs){
		if(!isObj(o))return undefined;
		var arr=[];
		if(!isArr(attrs))attrs=attrs.split(',');
		for(var n in attrs)
		{
			var a=attrs[n];
			if(a in o) arr.push(a);
		}
		return arr;
	}
	function setPV(pt,v){//点向式构造直线
		var p=CHIpoint3D(pt),x=p.x,y=p.y,z=p.z,l=v.x,m=v.y,n=v.z;
		if(!l)//有向量为零的情况需要单独写
		{
			if(!m)//lm为零
			{
				o.a1=o.b2=1;
				o.a2=o.b1=o.c1=o.c2=0;
				o.d1=-x;
				o.d2=-y;
			}
			else if(!n)//ln为零
			{
				o.a1=o.c2=1;
				o.a2=o.c1=o.b1=o.b2=0;
				o.d1=-x;
				o.d2=-z;
			}
			else//只有l为零
			{
				o.a1=1; o.b1=o.c1=0; o.d1=-x;
				o.a2=0; o.b2=n; o.c2=-m; o.d2=z*m-y*n;
			}
		}
		else if(!m)
		{
			if(!n)//mn为零
			{
				o.a1=o.a2=o.c1=o.b2=0;
				o.b1=o.c2=1;
				o.d1=-y;
				o.d2=-z;
			}
			else//只有m为零
			{
				o.a1=o.c1=0; o.b1=1; o.d1=-y;
				o.a2=n; o.b2=0; o.c2=-l; o.d2=z*l-n*x;
			}
		}
		else if(!n)//只有n为零
		{
			o.a1=m; o.b1=-l; o.c1=0; o.d1=y*l-x*m;
			o.a2=o.b2=0; o.c2=1; o.d2=-z;
		}
		else//方向向量三参数都不为0
		{
			o.a1=m; o.b1=-l; o.c1=0; o.d1=y*l-x*m;
			o.a2=n; o.b2=0; o.c2=-l; o.d2=z*l-x*n;
		}
		o.x=x;o.y=y;o.z=z;o.l=l;o.m=m;o.n=n;
	}
	function cal(){//一般方程计算参数方程
		var v1=CHIvector3D(o.a1,o.b1,o.c1)
			,v2=CHIvector3D(o.a2,o.b2,o.c2)
			,dv=v1.outer(v2);
		o.l=dv.x; o.m=dv.y; o.n=dv.z;
		var p,o1={},o2={},r;
		if(o.l)//如果l不为0，x可取全体实数
		{
			o.x=0;
			o1={
				a:o.b1,
				b:o.c1,
				c:o.d1
			},o2={
				a:o.b2,
				b:o.c2,
				c:o.d2
			};
			r=Equation21(o1,o2);
			if(!r)return undefined;
			o.y=r.x;
			o.z=r.y;
		}
		else if(o.m)
		{
			o.y=0;
			o1={
				a:o.a1,
				b:o.c1,
				c:o.d1
			},o2={
				a:o.a2,
				b:o.c2,
				c:o.d2
			};
			r=Equation21(o1,o2);
			if(!r)return undefined;
			o.x=r.x;
			o.z=r.y;
		}
		else
		{
			o.z=0;
			o1={
				a:o.a1,
				b:o.b1,
				c:o.d1
			},o2={
				a:o.a2,
				b:o.b2,
				c:o.d2
			};
			r=Equation21(o1,o2);
			if(!r)return undefined;
			o.x=r.x;
			o.y=r.y;
		}
	}
	
	if(arg.length==1)
	{//直线构造直线
		var O=arg[0];
		o.a1=O.a1;		o.a2=O.a2;
		o.b1=O.b1;		o.b2=O.b2;
		o.c1=O.c1;		o.c2=O.c2;
		o.d1=O.d1;		o.d2=O.d2;
		o.l=O.l;		o.m=O.m;		o.n=O.n;
		o.x=O.x;		o.y=O.y;		o.z=O.z;
	}
	else if(arg.length==2)
	{//双参数
		var a=arg[0],b=arg[1];
		if(isArr(a) && isArr(b))
		{//双数组，各元素分别按abcd处理
			if(a.length<4 || b.length<4)return undefined;
			o.a1=a[0]; o.b1=a[1]; o.c1=a[2]; o.d1=a[3];
			o.a2=b[0]; o.b1=b[1]; o.c2=b[2]; o.d2=b[3];
			cal();
		}
		else if(isPoint3D(a) && isPoint3D(b))
		{//两点构造直线
			setPV(a,CHIvector3D(a,b));
		}
		else if(isPoint3D(a) && isVector3D(b) || isPoint3D(b) && isVector3D(a))
		{//点向式构造直线，V(l,m,n)是方向向量，P(x,y,z)是经过的点坐标
			var p,v;
			if(isPoint3D(a)){p=a;v=b;}
			else{p=b;v=a;}
			setPV(p,v);
		}
		else if(isPlane(a) && isPlane(b))
		{//两相交平面构造直线
			if(a.parallel(b))return undefined;
			o.a1=a.a; o.b1=a.b; o.c1=a.c; o.d1=a.d;
			o.a2=b.a; o.b2=b.b; o.c2=b.c; o.d2=b.d;
			cal();
		}
		else if(isPoint3D(a) && isLine3D(b) || isPoint3D(b) && isLine3D(a))
		{//一点一直线，过直线外一点做平行线（没办法做垂直线，因为有无数条）
			var p,v;
			if(isPoint3D(a)){p=a;v=b.dv;}
			else{p=b;v=a.dv;}
			setPV(p,v);
		}
		else if(isPlane(a) && isPoint3D(b) || isPoint3D(a) && isPlane(b))
		{//一点一平面，过点做平面的垂直线（没办法做平面外一点的平行线，因为有无数条）
			var p,v;
			if(isPoint3D(a)){p=a;v=b.nv;}
			else{p=b;v=a.nv;}
			setPV(p,v);
		}
		else if(isPlane(a) && isLine3D(b) || isLine3D(a) && isPlane(b))
		{//一线一平面，在平面上，做直线的射影（线不垂直于平面）
			if(a.str8(b))return undefined;
			var pl,ln;
			if(isPlane(a)){pl=a;ln=b;}
			else{pl=b;ln=a;}
			//在直线上取一点，在平面上做投影，再使用点向式
			var p=ln.getPoint(),
				ps=p.proj(pl);
			setPV(ps,pl.dv);
		}
		else if(isLine3D(a) && isLine3D(b))
		{//两条非平行线
			if(a.parallel(b))return undefined;
			var p=a.intersect(b),d1=a.dv,d2=b.dv,dv=d1.outer(d2);
			if(p)
			{//当直线相交，构造两条相交直线过交点的公垂线
				setPV(p,dv);
			}
			else
			{//当是异面直线，做与两条异面直线相交的公垂线
				var n1=d1.outer(dv),
					n2=d2.outer(dv),
					p1=a.getPoint(),
					p2=b.getPoint(),
					s1=CHIplane(p1,n1),
					s2=CHIplane(p2,n2);
				o.a1=s1.a; o.b1=s1.b; o.c1=s1.c; o.d1=s1.d;
				o.a2=s2.a; o.b2=s2.b; o.c2=s2.c; o.d2=s2.d;
				cal();
			}
		}
		else if(isObj(a) && isObj(b) && has(a,"a,b,c,d").length && has(b,"a,b,c,d").length)
		{
			o.a1=("a" in a) ? a.a : 0;
			o.b1=("b" in a) ? a.b : 0;
			o.c1=("c" in a) ? a.c : 0;
			o.d1=("d" in a) ? a.d : 0;
			o.a2=("a" in b) ? b.a : 0;
			o.b2=("b" in b) ? b.b : 0;
			o.c2=("c" in b) ? b.c : 0;
			o.d2=("d" in b) ? b.d : 0;
			cal();
		}
		else return undefined;
	}
	else if(arg.length==8)
	{//8个参数分别对应abcd
		o.a1=arg[0]; o.b1=arg[1]; o.c1=arg[2]; o.d1=arg[3];
		o.a2=arg[4]; o.b2=arg[5]; o.c2=arg[6]; o.d2=arg[7];
		cal();
	}
	else return undefined;
	
	o.dv=CHIvector3D(o.l,o.m,o.n);
	//直线绕X轴旋转alpha可以落到XOZ平面上，再绕Y轴旋转beta可以落到Z轴上，不同于向量本身的theta及phi角
	o.cosAlpha=o.n/module(o.m,o.n);
	o.sinAlpha=o.m/module(o.m,o.n);
	o.cosBeta=module(o.m,o.n)/module(o.l,o.m,o.n);
	o.sinBeta=o.l/module(o.l,o.m,o.n);
	o.getPoint=function(t){
		if(!t)t=0;
		t=float(t);
		return CHIpoint3D(
			o.x + o.l * t,
			o.y + o.m * t,
			o.z + o.n * t
		);
	}
	o.str8=o.straight=function(V_L_P){//直线与直线/向量/平面垂直
		var dv=o.dv;
		if(isVector3D(V_L_P)) return dv.str8(V_L_P);//方向向量与向量垂直
		else if(isLine3D(V_L_P)) return dv.str8(V_L_P.dv);//方向向量与方向向量垂直
		else if(isPlane(V_L_P)) return dv.parallel(V_L_P.nv);//方向向量与法向量平行
		return undefined;
	}
	o.parallel=function(V_L_P){//直线与直线/向量/平面平行（不严格判断直线与平面分离）
		var dv=o.dv;
		if(isVector3D(V_L_P)) return dv.parallel(V_L_P);
		else if(isLine3D(V_L_P)) return dv.parallel(V_L_P.dv);
		else if(isPlane(V_L_P)) return dv.str8(V_L_P.nv);
		return undefined;
	}
	o.equal=function(l){//判断两直线是否是重合（是同一条线），拥有平行的方向向量，且对方的点也在本直线上
		if(!isLine3D(l))return undefined;
		var pt=o.getPoint();
		return l.hasPoint(pt) && l.dv.parallel(o.dv);
	}
	o.on=function(p){//直线是否在平面上
		return isPlane(p) ? p.hasLine(o) : undefined;
	}
	o.hasPoint=function(p){//点在直线上（直线包含点），忽略精度误差
		if(!isPoint3D(p))return undefined;
		var pt=CHIpoint3D(p),x=pt.x,y=pt.y,z=pt.z;
		return fix(o.a1 * x + o.b1 * y + o.c1 * z + o.d1) == 0
			&& fix(o.a2 * x + o.b2 * y + o.c2 * z + o.d2) == 0;
	}
	o.intersect=function(lORp){//返回两直线交点或直线与平面，平行或异面直线返回undefined
		if(!isLine3D(lORp) && !isPlane(lORp) || o.parallel(lORp))return undefined;
		var o1={
			a:o.a1
			,b:o.b1
			,c:o.c1
			,d:o.d1
		},o2={
			a:o.a2
			,b:o.b2
			,c:o.c2
			,d:o.d2
		},o3={
			a:lORp.a1
			,b:lORp.b1
			,c:lORp.c1
			,d:lORp.d1
		},o4={
			a:lORp.a2
			,b:lORp.b2
			,c:lORp.c2
			,d:lORp.d2
		};
		var r1=Equation31(o1,o2,o3),r2=Equation31(o1,o2,o4);
		/*
		方程组的解，如果是不同，则为异面直线，因为不同的三个平面分别相交在不同的两个点
		如果都是undefined，说明两个直线平行，因为四个平面都没办法交在同一点上
		如果相同，才是正确的相交的点坐标
		*/
		return !r1 || r1.x!=r2.x || r1.y!=r2.y || r1.z!=r2.z ? undefined : CHIpoint3D(r1);
	}
	o.distance=function(P_L_P){//直线到点/平行线/平行平面的距离
		if(isPoint3D(P_L_P))
		{
			if(o.hasPoint(P_L_P))return 0;
			var p=CHIpoint3D(P_L_P);
			return p.distance(o);
		}
		else if(isLine3D(P_L_P))
		{//平行线间距离
			if(!o.parallel(P_L_P))return undefined;
			if(o.equal(P_L_P))return 0;
			var p=P_L_P.getPoint();
			return p.distance(o);
		}
		else if(isPlane(P_L_P))
		{//平行线面间距离
			if(!o.parallel(P_L_P))return undefined;
			if(P_L_P.hasLine(o))return 0;
			var p=o.getPoint();
			return p.distance(P_L_P);
		}
		else return undefined
	}
	o.noncoplaner=o.skewLines=function(l){//判断两直线是否是异面直线
		return isLine3D(l) ? !o.parallel(l) && !o.intersect(l) : undefined;
	}
	o.containPlane=function(p){//过直线外一点，做经过点及直线的平面
		if(!isPoint3D(p))return undefined;
		var pt=o.getPoint(),v=CHIvector3D(p,pt),dv=o.dv,nv=v.outer(dv);
		return CHIplane(p,nv);
	}
	o.straightPlane=function(p){//过一点做直线的垂直平面
		if(!isPoint3D(p))return undefined;
		var nv=o.dv;
		return CHIplane(p,nv);
	}
	//直线需要用变换矩阵
	o.constructor=CHIline3D;
	return o;
}
isLine3D=function(o){return o.constructor==CHIline3D;}
/*四点共面，为两条直线非异面直线*/
isOnSamePlane=function(p1,p2,p3,p4){
	if(!isPoint3D(p1) || !isPoint3D(p2) || !isPoint3D(p3) || !isPoint3D(p4))return undefined;
	var l1=CHIline3D(p1,p2),l2=CHIline3D(p3,p4);
	return !(l1.skewLines(l2));
}

//空间平面
function CHIplane()
{
	if(arguments.length<1)return undefined;
	var arg=arguments,o={};
	if(isArg(arg[0]))arg=arg[0];
	
	function setPV(pt,v){//点法式构造平面  a(X-x)+b(Y-y)+c(Z-z)=0
		var p=CHIpoint3D(pt);
		o.a=v.x;
		o.b=v.y;
		o.c=v.z;
		o.d=- v.x*p.x - v.y*p.y - v.z*p.z;
		o.x=p.x;
		o.y=p.y;
		o.z=p.z;
		calLMN();
	}
	function setLL(l1,l2){//两条相交直线构造平面，交点及方向向量的外积（法向量）
		var dv1=l1.dv,dv2=l2.dv;
		var nv=dv1.outer(dv2),p=l1.intersect(l2);
		setPV(p,v);
	}
	function calLMN(){//计算截距，平行为undefined
		o.l=o.a ? -o.d/o.a : undefined;
		o.m=o.b ? -o.d/o.b : undefined;
		o.n=o.c ? -o.d/o.c : undefined;
	}
	function calXYZ(){//用普通方程计算点法式的点
		if(o.c)
		{
			o.x=o.y=0;
			o.z=-o.d/o.c;
		}
		else if(o.b)
		{
			o.x=o.z=0;
			o.y=-o.d/o.b;
		}
		else//abc三个参数不可能同时为0
		{
			o.z=o.y=0;
			o.x=-o.d/o.a;
		}
	}
	
	if(arg.length==1)
	{//平面构造平面
		if(!isPlane(arg[0]))return undefined;
		var O=arg[0];
		o.a=O.a;
		o.b=O.b;
		o.c=O.c;
		o.d=O.d;
		o.l=O.l;
		o.m=O.m;
		o.n=O.n;
	}
	else if(arg.length==2)
	{//双参数
		var a=arg[0],b=arg[1];
		if(isVector3D(a) && isPoint3D(b) || isVector3D(b) && isPoint3D(a))
		{//一点P(l,m,n)一向量V(A,B,C)
			var p,v;
			if(isVector3D(a)){p=b;v=a;}
			else {p=a;v=b;}
			setPV(p,v)
		}
		else if(isLine3D(a) && isLine3D(b))
		{//两条非异面直线，构造平面
			if(!a.skewLines(b))return undefined;
			var pt;
			if(a.parallel(b))
			{
				var p1=a.getPoint(),p2=b.getPoint();
				a=CHIline3D(p1,p2);
			}
			setLL(a,b);
		}
		else if(isPoint3D(a) && isPlane(b) || isPoint3D(b) && isPlane(a))
		{//一点一平面，过平面外一点做平行平面（没办法做垂直平面，因为有无数个）
			var pt,pl;
			if(isPoint3D(a)){pt=a;pl=b;}
			else{pl=a;pt=b;}
			if(pl.hasPoint(pt))return undefined;
			setPV(pt,pl.nv);
		}
		else if(isLine3D(a) && isVector3D(b) || isLine3D(b) && isVector3D(a))
		{//一线一向量，当向量与线不平行时，使线沿向量方向移动，形成一个平面
			if(a.parallel(b))return undefined;
			var l,v;
			if(isLine3D(a)){l=a;v=b;}
			else {v=a;l=b;}
			var dv=l.dv,nv=dv.outer(v),p=l.getPoint();
			setPV(p,nv);
		}
		else return undefined;
	}
	else if(arg.length==3)
	{//三参数
		var a=arg[0],b=arg[1],c=arg[2];
		if(isPoint3D(a) && isPoint3D(b) && isPoint3D(c) && !isOnSameLine3D(a,b,c))
		{//使用不共线的三点构造平面，两个向量的外积是平面的法向量
			var v1=CHIvector3D(a,b),v2=CHIvector3D(a,c);
			var vn=v1.outer(v2);
			setPV(a,vn);
		}
		else if(!isNaN(a) && !isNaN(b) && !isNaN(c))
		{//三个实数，构造截距式方程x/l+y/m+z/n=1
			a=float(a); b=float(b); c=float(c);
			o.a=b*c;
			o.b=a*c;
			o.c=b*a;
			o.d=-a*b*c;
			o.l=a;
			o.m=b;
			o.n=c;
			calXYZ();
		}
		else if(isPoint3D(a) || isPoint3D(b) || isPoint3D(c))
		{//一点及两个不平行的向量或直线，构造平面
			var p,v1,v2;
			if(isPoint3D(a)){p=a;v1=b;v2=c;}
			else if(isPoint3D(b)){p=b;v1=a;v2=c;}
			else{p=c;v1=b;v2=a;}
			if(!isVector3D(v1) && !isLine3D(v1) || !isLine3D(v2) && !isVector3D(v2) || v1.parallel(v2))return undefined;
			if(isLine3D(v1))v1=v1.dv;
			if(isLine3D(v2))v2=v2.dv;
			var nv=v1.outer(v2);
			setPV(p,nv);
		}
		else return undefined;
	}
	else if(arg.length>=4)
	{//4个数字构造平面一般式方程Ax+By+Cz+D=0，四参不能全为零
		var a=float(arg[0]),b=float(arg[1]),c=float(arg[2]),d=float(arg[3]);
		if(!a && !b && !c&& !d)return undefined;
		o.a=a;
		o.b=b;
		o.c=c;
		o.d=d;
		calLMN();
		calXYZ();
	}
	else return false;
	
	//平面的法向量
	o.nv=o.normal=CHIvector3D(o.a,o.b,o.c);
	o.toString=function(){
		return o.a +'*x + '+ o.b +'*y + '+ o.c +'*z + '+ o.d +' =0';
	}
	o.theta=function(V_L_P){//平面与向量/直线/平面的夹角，在0~PI/2之间
		var nv=o.nv,dv,t,PI5=PI/2;
		if(isPlane(V_L_P))//两平面夹角
		{
			dv=V_L_P.nv;
			t=nv.theta(dv);
			if(t>PI5)t=PI-t;
		}
		else if(isLine3D(V_L_P))//平面与直线夹角
		{
			dv=V_L_P.dv;
			t=abs(nv.theta(dv)-PI5);
		}
		else if(isVector3D(V_L_P))//向量与直线夹角
		{
			dv=V_L_P;
			t=nv.theta(dv);
			if(t>PI5)t=PI-t;
		}
		else return undefined;
		return t;
	}
	o.thetaXY=function(){var t=o.nv.theta(CHIvector3D(0,0,1)); if(t>PI/2) t=PI-t; return t;}
	o.thetaXZ=function(){var t=o.nv.theta(CHIvector3D(0,1,0)); if(t>PI/2) t=PI-t; return t;}
	o.thetaYZ=function(){var t=o.nv.theta(CHIvector3D(1,0,0)); if(t>PI/2) t=PI-t; return t;}
	o.equal=function(p){//判断两平面是否重合（是同一平面），平行且一点共用
		return isPlane(p) ? o.parallel(p) && p.hasPoint(o.getPoint()) : undefined;
	}
	o.parallel=function(V_L_P){//是否与平面/直线/向量平行
		var nv=o.nv;
		if(isPlane(V_L_P)) return nv.parallel(V_L_P.nv);//法向量平行，平面平行
		else if(isLine3D(V_L_P)) return nv.str8(V_L_P.dv);//法向量垂直于方向向量，平面与直线平行
		else if(isVector3D(V_L_P)) return nv.str8(V_L_P);//法向量垂直于向量，向量与平面平行
		else return undefined;
	}
	o.str8=o.straight=function(V_L_P){//是否与平面/直线/向量垂直
		var nv=o.nv;
		if(isPlane(V_L_P)) return nv.str8(V_L_P.nv);//法向量垂直，平面垂直
		else if(isLine3D(V_L_P)) return nv.parallel(V_L_P.dv);//法向量平行方向向量，平面与直线垂直
		else if(isVector3D(V_L_P)) return nv.parallel(V_L_P);//法向量平行于向量，向量与平面垂直
		else return undefined;
	}
	//可直接返回点法式的点，也可返回与三坐标面交线上的点
	o.getPoint=function(t){
		if(t===undefined)return CHIpoint3D(o.x,o.y,o.z);
		var l=o.lineXY();//任意平面与三个坐标面至少有两条交线，最多有三条
		if(!l)l=o.lineXZ();
		if(!l)l=o.lineYZ();
		return l.getPoint(t);
	}
	//平面与XOY，YOZ，XOZ三个平面的交线，通过三截距L(l,0,0) M(0,m,0) N(0,0,n)求得
	o.lineXY=function(){//一个截距存在，象征两个坐标面的交线存在
		var p1,p2,l=o.l,m=o.m;
		if(!l && !m) return undefined;
		if(!l) {p1=[0,m,0];p2=[1,m,0];}
		else if(!m) {p1=[l,0,0];p2=[l,1,0];}
		else{p1=[l,0,0];p2=[0,m,0];}
		return CHIline3D(p1,p2);
	}
	o.lineXZ=function(){
		var p1,p2,l=o.l,n=o.n;
		if(!l && !n)return undefined;
		if(!l){p1=[0,0,n];p2=[1,0,n];}
		else if(!n){p1=[l,0,0];p2=[l,0,1];}
		else {p1=[l,0,0];p2=[0,0,n];}
		return CHIline3D(p1,p2);
	}
	o.lineYZ=function(){
		var p1,p2,m=o.m,n=o.n;
		if(!m && !n)return undefined;
		if(!m){p1=[0,0,n];p2=[0,1,n];}
		else if(!n){p1=[0,m,0];p2=[0,m,1];}
		return CHIline3D(p1,p2);
	}
	o.hasPoint=function(p){
		return isPoint3D(p) ?
			fix(o.a * p.x + o.b * p.y + o.c * p.z + o.d) ==0
			:undefined;
	}
	o.hasLine=function(l){//线在平面上，即线上两点在平面上
		return isLine3D(l) ? o.hasPoint(p.getPoint(0)) && o.hasPoint(p.getPoint(1)) : undefined;
	}
	o.parallelPlane=function(pORl){//过平面外一点做平行平面，或过平面外一平行直线做平行平面
		var pt,nv=o.nv;
		if(isPoint3D(pORl))
		{
			if(o.hasPoint(pORl))return undefined;
			pt=pORl;
		}
		else if(isLine3D(pORl))
		{
			if(o.hasLine(pORl) || !o.parallel(pORl))return undefined;
			pt=pORl.getPoint(0);
		}
		else return undefined;
		return CHIplane(pt,nv);
	}
	o.straightPlane=function(l){//过一条与平面不垂直的直线，做垂直平面（与平面垂直的直线可做无数垂直面）
		if(!isLine3D(l) || o.str8(l)) return undefined;
		var v1=l.dv,v2=o.nv,p=l.getPoint(0);
		return CHIplane(v1.outer(v2),p);
	}
	//平面需要用变换矩阵
	o.constructor=CHIplane;
	return o;
}

isPlane=function(o){return o.constructor==CHIplane;}