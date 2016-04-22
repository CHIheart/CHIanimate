//在形状上使用的运算库
function theta2angle(t){return 180*t/Math.PI;}
function angle2theta(a){return Math.PI*a/180;}
function isPoint(o)
{
	return o && (
		("x" in o) && ("y" in o)
		|| ("t" in o) && ("r" in o)
		|| o.constructor==Array && o.length==2
	)
	;
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

function intersect(obj1,obj2)
{
	function getShape(obj)
	{
		var s;
		if(obj instanceof CHIline) s='l';
		else if(obj instanceof CHIparabola) s='p';
		else if(obj instanceof CHIcircle) s='c';
		else if(obj instanceof CHIellipse) s='e';
		else s=undefined;
		return s;
	}
	var s1=getShape(obj1),s2=getShape(obj2);
	if(!s1 || !s2) return undefined;
	switch(s1+s2)
	{
		case "ll":
			var o1={
				a:obj1.a
				,b:obj1.b
				,c:obj1.c
			},o2={
				a:obj2.a
				,b:obj2.b
				,c:obj2.c
			};
			var r=Equation21(o1,o2);
			return r==undefined?"parallel":r;
			break;
		case "pl":
			var obj=obj1,obj1=obj2,obj2=obj;
		case "lp":
			var a=obj1.a,b=obj1.b,c=obj1.c,
				m=obj2.a,n=obj2.b,p=obj2.c;
			var o={
				a:b*m
				,b:b*n + a
				,c:c + b*p
			};
			var x=Equation12(o);
			if(typeof x !="object")
			{
				return {x:x,y:obj1.getY(x)};
			}
			return [
				{x:x[0],y:obj1.getY(x[0])}
				,{x:x[1],y:obj1.getY(x[1])}
			];
			break;
		case "pp":
			var o={
				a:obj1.a-obj2.a
				,b:obj1.b-obj2.b
				,c:obj1.c-obj2.c
			};
			var x=Equation12(o);
			if(typeof x !="object")
			{
				if(x==undefined) return undefined;
				return {x:x,y:obj1.getY(x)};
			}
			return [
				{x:x[0],y:obj1.getY(x[0])}
				,{x:x[1],y:obj1.getY(x[1])}
			];
			break;
		case "cl":
			var obj=obj1,obj1=obj2,obj2=obj;
		case "lc":
			var x,y,o;
			if(!obj1.b)
			{
				x=-1 * obj1.c / obj1.a;
				o={
					a:1
					,b:obj2.e
					,c:x*x + x * obj2.d + obj2.f
				};
				y=Equation12(o);
				if(y==undefined)return undefined;
				else if(typeof y !="object") return {x:x,y:y};
				else return [{x:x,y:y[0]},{x:x,y:y[1]}];
			}
			else if(!obj1.a)
			{
				y=-1 * obj1.c / obj1.b;
				o={
					a:1
					,b:obj2.d
					,c:y*y + y * obj2.e + obj2.f
				};
				x=Equation12(o);
				if(x==undefined)return undefined;
				else if(typeof x !="object") return {x:x,y:y};
				else return [{x:x[0],y:y},{x:x[1],y:y}];
			}
			else
			{
				var k=obj1.k,h=obj1.h,e=obj2.e;
				o={
					a:1 + k*k
					,b:2*k*h + obj2.d + e*k
					,c:e*h + obj2.f + h*h
				};
				x=Equation12(o);
				if(x==undefined)return undefined;
				else if(typeof x !="object") return {x:x,y:obj1.getY(x)};
				else return [{x:x[0],y:obj1.getY(x[0])},{x:x[1],y:obj1.getY(x[1])}];
			}
			break;
		case "cc":
			var l=new CHIline('_temp_line');
			l.setABC(obj1.d-obj2.d, obj1.e-obj2.e, obj1.f-obj2.f);
			return intersect(l,obj2);
			break;
		default: return undefined;
	}
}
