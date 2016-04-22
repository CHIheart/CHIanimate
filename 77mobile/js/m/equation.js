//一元一次：r * x + v = 0
function Equation(o)
{
	return (o.r)?(o.v/o.r * -1 || 0) : undefined;
}
//二元一次：a * x + b * y + c = 0
function Equation21(o1,o2)
{
	function test(o)
	{//参数a，b不能同时不存在或为零
		return o.a || o.b;
	}
	if(!test(o1) || !test(o2))return undefined;
	var a=o1.a || 0,
		b=o1.b || 0,
		c=o1.c || 0,
		m=o2.a || 0,
		n=o2.b || 0,
		p=o2.c || 0;
	if(a*n==b*m)return undefined;
	return {
		x:(b*p-c*n)/(a*n-b*m)
		,y:(a*p-c*m)/(b*m-a*n)
	};
}
//三元一次：a * x + b * y + c * z + d = 0
function Equation31(o1,o2,o3)
{
	function test(o)
	{//参数a，b，c不能同时不存在或为零
		return o.a || o.b || o.c;
	}
	function seek(arr)
	{//找到z有系数c的式子
		for(var n in arr)
		{
			var o=arr[n];
			if(o.c)return o;
		}
		return undefined;
	}
	if(!test(o1) || !test(o2) || !test(o3))return undefined;
	var a1=o1.a || 0,	b1=o1.b || 0,	c1=o1.c || 0,	d1=o1.d || 0,
		a2=o2.a || 0,	b2=o2.b || 0,	c2=o2.c || 0,	d2=o2.d || 0,
		a3=o3.a || 0,	b3=o3.b || 0,	c3=o3.c || 0,	d3=o3.d || 0;
	var oo1={
		a:a1*c2-a2*c1
		,b:b1*c2-b2*c1
		,c:d1*c2-d2*c1
	},oo2={
		a:a1*c3-a3*c1
		,b:b1*c3-b3*c1
		,c:d1*c3-d3*c1
	};
	var rXY=Equation21(oo1,oo2);
	if(rXY==undefined)return undefined;
	var x=rXY.x,y=rXY.y;
	var o=seek([o1,o2,o3]);
	var z=-1 * (o.a * x + o.b * y + o.d)/o.c;
	return {x:x,y:y,z:z};
}
//一元二次：a * x * x + b * x + c = 0
function Equation12(o)
{//参数a，b不能同时不存在或为零
	if(!o.a && !o.b)return undefined;
	if(!o.a) return Equation({r:o.b,v:o.c});
	var a=o.a || 0,
		b=o.b || 0,
		c=o.c || 0;
	var delta= b * b - 4 * a * c;
	if(delta<0) return undefined;
	else if(!delta) return -0.5 * b / a;
	return [
		(-1 * b + Math.sqrt(delta)) / a*0.5
		,(-1 * b - Math.sqrt(delta)) / a*0.5
	];
}
