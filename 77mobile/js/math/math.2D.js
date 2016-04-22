//二维坐标系，参数为屏幕坐标，表示本坐标系中心点

function CHIxy(cX, cY) {
	if (!cX) cX = 0;
	if (!cY) cY = 0;
	var o = {};
	o.center = o.cp = [float(cX), float(cY)];
	o.toString = function() {
		return 'CHI coordinate system 2D @ (' + this.cp[0] + ',' + this.cp[1] + ')'
	}
	o.map = function(p) { //二维坐标系，映射到屏幕坐标，将y坐标取负，再位移点
		if (!isPoint2D(p)) return undefined;
		var pt = CHIpoint2D(p);
		pt.y *= -1;
		pt.x += this.cp[0];
		pt.y += this.cp[1];
		return pt;
	}
	return o;
}
//二维坐标系中的点

function CHIpoint2D() {
	if (arguments.length < 1) return undefined;
	var arg = arguments,
		o = {};
	if (isArg(arg[0])) arg = arg[0];

	function cal() { //已知xy，计算rt
		o.r = module(o.x, o.y);
		o.t = o.x ? atan(o.y / o.x) : PI / 2;
		if (o.y < 0) o.t += PI; //如果y<0，则要加半周
	}

	if (arg.length == 1) {
		arg = arg[0];
		if (isArr(arg)) //如果参数是一个数组，按xy计算
		{
			if (arg.length < 2) return undefined;
			o.x = float(arg[0]);
			o.y = float(arg[1]);
			cal();
		} else if (isObj(arg)) //如果参数是一个对象
		{
			//如果是由point类来的，必然会有x/y/r/t属性
			if ('x' in arg && 'y' in arg) {
				o.x = float(arg.x);
				o.y = float(arg.y);
				cal();
			} else if ('r' in arg && 't' in arg) {
				o.r = float(arg.r);
				o.t = float(arg.t);
				o.x = o.r * cos(o.t);
				o.y = o.r * sin(o.t);
			} else return undefined;
		} else return undefined;
	} else if (arg.length >= 2) //如果参数有2个数值，按xy计算
	{
		if (!isNaN(arg[0]) && !isNaN(arg[1])) {
			o.x = float(arg[0]);
			o.y = float(arg[1]);
			cal();
		} else return undefined;
	} else return undefined;

	o.toString = function(type) { //默认返回xy坐标；当type=rt时返回极坐标
		return type && type.toLowerCase() == 'rt' ? fix(o.r) + ',' + fix(o.t) : fix(o.x) + ',' + fix(o.y);
	}
	o.equal = function() { //判断相等的点，忽略精度误差
		var np = CHIpoint2D(arguments);
		return fix(np.x) == fix(o.x) && fix(np.y) == fix(o.y);
	}
	o.distance = function(pORl) { //两点距离，或点到直线的距离
		if (isPoint2D(pORl)) {
			var pt = CHIpoint2D(pORl);
			return module(o.x - pt.x, o.y - pt.y);
		} else if (isLine2D(pORl)) {
			var a = pORl.a,
				b = pORl.b;
			return abs(a * o.x + b * o.y + pORl.c) / module(a, b);
		} else return undefined;
	}
	o.transform = function(mat) { //矩阵变换，参数必须使用CHImatrix对象的实例，且必须是3*3的矩阵
		if (!checkMatrix || !isMatrix(mat) || mat.row != 3 || mat.col != 3) return undefined;
		var me = CHImatrix(1, 3);
		me.set(o.x, o.y, 1);
		var r = me.pre(mat);
		if (r[0][2]) {
			r[0][0] /= r[0][2];
			r[0][1] /= r[0][2];
		}
		return CHIpoint2D(r[0]);
	}
	o.translate = function(x, y) { //平移变换
		if (!checkMatrix) return false;
		if (!y) y = 0;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, 0, 0, 0, 1, 0, float(x), float(y), 1);
		return o.transform(mat);
	}
	o.rotate = function(a, p) { //旋转变换，第三参可以是一个"点"
		var t = a2t(float(a));
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		var ct = cos(t),
			st = sin(t);
		if (isPoint2D(p)) {
			var pt = CHIpoint2D(p),
				x = pt.x,
				y = pt.y;
			mat.set(
			ct, st, 0, -st, ct, 0, (1 - ct) * x + y * st, (1 - ct) * y - x * st, 1);
		} else mat.set(
		ct, st, 0, -st, ct, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.scale = function(x, y, p) { //缩放变换，第三参可以是一个“点”
		if (!checkMatrix) return false;
		if (y === undefined) y = x;
		var mat = CHImatrix(3, 3);
		x = float(x);
		y = float(y);
		if (isPoint2D(p)) {
			var pt = CHIpoint2D(p),
				px = pt.x,
				py = pt.y;
			mat.set(
			x, 0, 0, 0, y, 0, (1 - x) * px, (1 - y) * py, 1);
		} else mat.set(
		x, 0, 0, 0, y, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.skewX = function(x) { //沿X轴拉伸变换
		if (!checkMatrix || isNaN(x) || !x) return false;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, 0, 0, float(x), 1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.skewY = function(y) { //沿X轴拉伸变换
		if (!checkMatrix || isNaN(y) || !y) return false;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, float(y), 0, 0, 1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflectX = o.flipX = function() { //X轴反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, 0, 0, 0, -1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflectY = o.flipY = function() { //Y轴反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		mat.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflect = o.flip = function(line) { //沿任意直接做反射变换，如果无参则按原点做反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		if (!line) //无参数则按原点反射
		mat.set(-1, 0, 0, 0, -1, 0, 0, 0, 1);
		else if (isLine2D(line)) {
			var a = line.a,
				b = line.b,
				c = line.c,
				t = line.t,
				c2t = cos(2 * t),
				s2t = sin(2 * t);
			if (!a) //平行于X轴的直线
			mat.set(
			1, 0, 0, 0, -1, 0, 0, -2 * c / b, 1);
			else if (!b) //平行于Y轴的直线
			mat.set(-1, 0, 0, 0, 1, 0, -2 * c / a, 0, 1);
			else //任意直线，不与坐标轴平行
			mat.set(
			c2t, s2t, 0, s2t, -c2t, 0, (c2t - 1) * c / a, s2t * c / a, 1);
		} else return undefined;
		return o.transform(mat);
	}
	o.constructor = CHIpoint2D;
	return o;
}
/*
二维坐标系中的点
	1.拥有2个元素的数组
	2.拥有x及y属性的对象
	3.拥有r及t/theta属性的对象
	4.不是CHIvector2D的实例
*/
isPoint2D = function(o) {
	return isArr(o) && o.length >= 2 || isObj(o) && ('x' in o && 'y' in o || 'r' in o && 't' in o) && o.constructor != CHIvector2D;
	return false;
}

//平面向量

function CHIvector2D() {
	if (arguments.length < 1) return undefined;
	var arg = arguments,
		o = {};
	if (isArg(arg[0])) arg = arg[0];

	function calXY() { //已知rt，求xy
		o.x = o.r * cos(o.t);
		o.y = o.r * sin(o.t);
	}

	function calRT() { //已知xy，求rt
		o.r = module(o.x, o.y);
		o.t = o.x ? atan(o.y / o.x) : PI / 2;
		if (o.y < 0) o.t += PI; //如果y<0，则要加半周
	}

	if (arg.length == 1) {
		arg = arg[0];
		if (isArr(arg)) //如果参数是一个有至少两个元素的数组，按xy计算
		{
			if (arg.length < 2) return undefined;
			o.x = float(arg[0]);
			o.y = float(arg[1]);
			calRT();
		} else if (isObj(arg)) //如果参数是一个对象
		{ //有可能是向量或点
			if ('x' in arg && 'y' in arg) { //使用x/y属性
				o.x = float(arg.x);
				o.y = float(arg.y);
				calRT();
			} else if ('r' in arg && 't' in arg) { //使用r/t属性作为模长及倾角，可用于表示速度
				o.r = float(arg.r);
				o.t = float(arg.t);
				calXY();
			} else return undefined;
		} else return undefined;
	} else if (arg.length >= 2) //如果参数至少有2个值
	{
		var a = arg[0],
			b = arg[1];
		if (isPoint2D(a) && isPoint2D(b)) { //使用两点式初始化向量
			var pS = CHIpoint2D(a),
				pE = CHIpoint2D(b);
			o.x = pE.x - pS.x;
			o.y = pE.y - pS.y;
		} else if (isVector2D(a) && !isNaN(b) || isVector2D(b) && !isNaN(a)) { //使用方向向量及模长构造向量
			var v, m;
			if (isVector2D(a)) {
				v = a;
				m = b;
			} else {
				v = b;
				m = a;
			}
			m = float(m);
			o.x = v.x / v.m * m;
			o.y = v.y / v.m * m;
		} else if (!isNaN(a) && !isNaN(b)) { //使用两个数字，按xy计算
			o.x = float(a);
			o.y = float(b);
		} else return undefined;
		calRT();
	} else return undefined;

	o.m = o.module = module(o.x, o.y); //计算模长
	o.toString = function(type) { //默认返回xy坐标，可用于计算，但是rt坐标就只能显示字符串形式
		return type && type.toLowerCase() == 'rt' ? fix(o.r) + ',' + fix(o.t) : fix(o.x) + ',' + fix(o.y);
	}

	//单位向量
	o.u = o.unit = function() {
		return o.times(1 / o.m);
	}
	//反向量
	o.neg = o.negative = function() {
		return o.times(-1);
	}
	o.add = o.plus = function(v) {
		return isVector2D(v) ? CHIvector2D(v.x + o.x, v.y + o.y) : undefined;
	}
	o.minus = o.substract = function(v) {
		return isVector2D(v) ? CHIvector2D(o.x - v.x, o.y - v.y) : undefined;
	}
	o.times = o.multi = o.multiple = function(c) {
		c = float(c);
		return CHIvector2D(o.x * c, o.y * c);
	}
	o.inner = function(v) {
		return isVector2D(v) ? (o.x * v.x + o.y * v.y) : undefined;
	}
	o.theta = function(V_L) { //向量的夹角是在0~PI之间
		if (!isVector2D(V_L) && !isLine2D(V_L)) return undefined;
		var v = isVector2D(V_L) ? V_L : V_L.dv;
		var t = acos(o.inner(v) / o.m / v.m);
		if (t < 0) t += PI / 2;
		return t;
	}
	o.angle = function(v) {
		return t2a(o.theta(v));
	}
	o.str8 = o.straight = o.right = function(v) {
		return isVector2D(v) ? o.inner(v) === 0 : undefined;
	}
	o.outer = function(v) { //平面向量的外积只返回模长
		return isVector2D(v) ? abs(o.x * v.y - o.y * v.x) : undefined;
	}
	o.parallel = function(v) {
		return isVector2D(v) ? o.outer(v) === 0 : undefined;
	}
	o.start = function(pend) {
		if (!isPoint2D(pend)) return undefined;
		var p = CHIpoint2D(pend);
		return CHIpoint2D(p.x - o.x, p.y - o.y);
	}
	o.end = function(pstart) {
		if (!isPoint2D(pstart)) return undefined;
		var p = CHIpoint2D(pstart);
		return CHIpoint2D(p.x + o.x, p.y + o.y);
	}
	o.proj = o.projection = function(T_V_L) { //本向量在某一方向角（弧度）/向量/直线上的分量，即射影
		var theta;
		if (isVector2D(T_V_L) || isLine2D(T_V_L)) theta = T_V_L.t;
		else if (!isNaN(T_V_L)) theta = float(T_V_L);
		else return undefined;
		var nr = o.r * cos(o.t - theta);
		return CHIvector2D({
			r: nr,
			t: theta
		});
	}
	o.translate = function() {} //向量平移仍然是自己
	o.rotate = function(a) { //向量旋转会变化，但旋转的中心点无差别
		a = float(a);
		var p1 = CHIpoint2D(0, 0),
			p2 = CHIpoint2D(o.x, o.y);
		p1 = p1.rotate(a);
		p2 = p2.rotate(a);
		return CHIvector2D(p1, p2);
	}
	//暂时二维向量不做平移及旋转之外的动作
	o.constructor = CHIvector2D;
	return o;
}
isVector2D = function(o) {
	return o.constructor == CHIvector2D;
} /*三点共线，为两个拥有共同起点的向量平行*/
isOnSameLine2D = function(p1, p2, p3) {
	if (!isPoint2D(p1) || !isPoint2D(p2) || !isPoint2D(p3)) return undefined;
	var v1 = CHIvector2D(p1, p2),
		v2 = CHIvector2D(p1, p3);
	return v1.parallel(v2);
}

//平面直线

function CHIline2D() {
	if (arguments.length < 1) return undefined;
	var arg = arguments,
		o = {};

	function calKH() { //已知abc求kht
		if (o.a < 0) {
			o.a *= -1;
			o.b *= -1;
			o.c *= -1;
		}
		o.t = o.theta = o.b ? atan(-o.a / o.b) : PI / 2;
		o.k = o.b ? -o.a / o.b : undefined;
		o.h = o.b ? -o.c / o.b : undefined;
	}

	function calABC() { //已知kh求abct
		o.a = o.k;
		o.b = -1;
		o.c = o.h;
		if (o.a < 0) {
			o.a *= -1;
			o.b *= -1;
			o.c *= -1;
		}
		o.t = o.theta = atan(o.k);
	}

	function setPP(pt1, pt2) { //两点式求方程
		var p1 = CHIpoint2D(pt1),
			p2 = CHIpoint2D(pt2);
		var x1 = p1.x,
			y1 = p1.y,
			x2 = p2.x,
			y2 = p2.y;
		//两点相同无法创建直线
		if (p1.equal(p2)) return undefined;
		o.a = y2 - y1;
		o.b = x1 - x2;
		o.c = x1 * y2 - x2 * y1;
	}
	if (arg.length >= 3) { //使用三个数字，创建标准方程ax+by+c=0，前两个参数不可同时为0
		if (isNaN(arg[0]) || isNaN(arg[1]) || isNaN(arg[2]) || (!fix(arg[0]) && !fix(arg[1]))) return undefined;
		o.a = arg[0];
		o.b = arg[1];
		o.c = arg[2];
		calKH();
	} else if (arg.length == 2) { //两个参数
		var a = arg[0],
			b = arg[1];

		if (!isNaN(a) && !isNaN(b)) { //双参都是数字，创建斜截式方程y=kx+h，第一参为斜率，第二参为截距
			o.k = a;
			o.h = b;
			calABC();
		} else if (!isNaN(a) && isPoint2D(b) || !isNaN(b) && isPoint2D(a)) { //一参为数字，另一参为点，创建点斜式方程y-Py=k(x-Px)
			var p, k;
			if (isPoint2D(a)) {
				p = a;
				k = b;
			} else {
				p = b;
				k = a;
			}
			var pt = CHIpoint2D(p);
			o.k = k;
			o.h = pt.y - k * pt.x;
			calABC();
		} else if (isPoint2D(a) && isVector2D(b) || isPoint2D(b) && isVector2D(a)) { //一参为点对象，另一参为向量对象，创建点向式方程(x-Px)/Vx=(y-Py)/Vy
			var p, v;
			if (isVector2D(a)) {
				p = b;
				v = a;
			} else {
				p = a;
				v = b;
			}
			p = CHIpoint2D(p);
			o.a = v.y;
			o.b = -v.x;
			o.c = p.y * v.x - p.x * v.y;
			calKH();
		} else if (isPoint2D(a) && isPoint2D(b)) { //双参都是点对象，创建两点式方程(y-y1)/(y2-y1)=(x-x1)/(x2-x1)
			setPP(a, b);
			calKH();
		} else return undefined;
	} else if (isLine2D(arg[0])) { //使用一个直线对象创建直线
		var O = arg[0];
		o.a = O.a;
		o.b = O.b;
		o.c = O.c;
		o.k = O.k;
		o.h = O.h;
		o.t = O.t;
	} else return undefined;

	o.toString = function() {
		return fix(o.a) + '*x + ' + fix(o.b) + '*y + ' + fix(o.c) + '=0';
	}
	o.dv = o.directionVector = CHIvector2D(-o.b, o.a);
	o.str8 = o.straight = function(V_L) { //直线（或与向量）垂直，则方向向量垂直
		var dv = o.dv;
		if (isVector2D(V_L)) return dv.str8(V_L);
		else if (isLine2D(V_L)) return dv.str8(V_L.dv);
		return undefined;
	}
	o.parallel = function(V_L) { //直线（或向量）平行，则方向向量平行
		var dv = o.dv;
		if (isVector2D(V_L)) return dv.parallel(V_L);
		else if (isLine2D(V_L)) return dv.parallel(V_L.dv);
		return undefined;
	}
	o.equal = function(l) { //判断两直线是否是重合（是同一条线）
		if (!isLine2D(l)) return undefined;
		var r;
		if (!o.b) r = l.b ? o : fix(o.c / this.a) == fix(l.c / l.a);
		else r = fix(o.a / o.b) == fix(l.a / l.b) && fix(o.c / this.b) == fix(l.c / l.b);
		return r;
	}
	o.getY = function(x) { //根据x值获取y，如果是竖直的线，且x值正确的话，则y随机取
		return o.b ? (o.a * x + o.c) / -o.b : (x == -o.c / o.a ? rand() : undefined);
	}
	o.getX = function(y) { //根据y值获取x，如果是水平的线，且y值正确的话，则x随机取
		return this.a ? (this.b * y + this.c) / -this.a : (y == -this.c / this.b ? rand() : undefined);
	}
	o.transform = function(mat) { //矩阵变换，参数必须使用CHImatrix对象的实例，且必须是3*3的矩阵
		if (!checkMatrix || !isMatrix(mat) || mat.row != 3 || mat.col != 3) return undefined;
		var p1, p2;
		if (!this.b) //如果是竖直的线，则y取0和1，x则为固定值
		{
			p1 = CHIpoint2D(-o.c / o.a, 0);
			p2 = CHIpoint2D(-o.c / o.a, 1);
		} else //如果是其它线，则x取0和1，y为固定值（水平线）或计算值（斜线）
		{
			p1 = CHIpoint2D(0, o.getY(0));
			p2 = CHIpoint2D(1, o.getY(1));
		}
		var v1 = CHImatrix(1, 3),
			v2 = CHImatrix(1, 3);
		v1.set(p1.x, p1.y, 1);
		v2.set(p2.x, p2.y, 1);
		var r1 = v1.pre(mat),
			r2 = v2.pre(mat);
		if (r1[0][2]) {
			r1[0][0] /= r1[0][2];
			r1[0][1] /= r1[0][2];
		}
		if (r2[0][2]) {
			r2[0][0] /= r2[0][2];
			r2[0][1] /= r2[0][2];
		}
		return CHIline2D(r1[0], r2[0]);
	}
	o.translate = function(x, y) { //平移变换
		if (!checkMatrix) return false;
		if (!y) y = 0;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, 0, 0, 0, 1, 0, float(x), float(y), 1);
		return o.transform(mat);
	}
	o.rotate = function(a, p) { //旋转变换，第三参可以是一个"点"
		var t = a2t(float(a));
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		var ct = cos(t),
			st = sin(t);
		if (isPoint2D(p)) {
			var pt = CHIpoint2D(p),
				x = pt.x,
				y = pt.y;
			mat.set(
			ct, st, 0, -st, ct, 0, (1 - ct) * x + y * st, (1 - ct) * y - x * st, 1);
		} else mat.set(
		ct, st, 0, -st, ct, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.scale = function(x, y, p) { //缩放变换，第三参可以是一个"点"
		if (!checkMatrix) return false;
		if (y === undefined) y = x;
		var mat = CHImatrix(3, 3);
		x = float(x);
		y = float(y);
		if (isPoint2D(p)) {
			var pt = new CHIpoint2D(p),
				px = pt.x,
				py = pt.y;
			mat.set(
			x, 0, 0, 0, y, 0, (1 - x) * px, (1 - y) * py, 1);
		} else mat.set(
		x, 0, 0, 0, y, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.skew = function(x, y) { //拉伸变换，在x坐标上加y量，在y坐标上加x量
		if (!checkMatrix) return false;
		if (!y) y = 0;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, float(y), 0, float(x), 1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflectX = o.flipX = function() { //X轴反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		mat.set(
		1, 0, 0, 0, -1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflectY = o.flipY = function() { //Y轴反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		mat.set(-1, 0, 0, 0, 1, 0, 0, 0, 1);
		return o.transform(mat);
	}
	o.reflect = o.flip = function(line) { //沿任意直接做反射变换，如果无参则按原点做反射变换
		if (!checkMatrix) return false;
		var mat = CHImatrix(3, 3);
		if (!line) //无参数则按原点反射
		mat.set(-1, 0, 0, 0, -1, 0, 0, 0, 1);
		else if (isLine2D(line)) {
			var a = line.a,
				b = line.b,
				c = line.c,
				t = line.t,
				c2t = cos(2 * t),
				s2t = sin(2 * t);
			if (!a) //平行于X轴的直线
			mat.set(
			1, 0, 0, 0, -1, 0, 0, -2 * c / b, 1);
			else if (!b) //平行于Y轴的直线
			mat.set(-1, 0, 0, 0, 1, 0, -2 * c / a, 0, 1);
			else //任意直线，不与坐标轴平行
			mat.set(
			c2t, s2t, 0, s2t, -c2t, 0, (c2t - 1) * c / a, s2t * c / a, 1);
		} else return undefined;
		return o.transform(mat);
	}
	o.hasPoint = function(p) { //点在直线上（直线包含点），忽略精度误差
		if (!isPoint2D(p)) return undefined;
		var pt = CHIpoint2D(p);
		return fix(o.a * pt.x + o.b * pt.y + o.c) == 0;
	}
	o.straightLine = function(p) { //过任意一点与本直线平行的直线
		if (!isPoint2D(p)) return undefined;
		var v = o.dv.rotate(90); //本直线的方向向量旋转90度，为垂线的方向向量
		return CHIline2D(p, v); //点向式构造垂线方程
	}
	o.parallelLine = function(p) { //过直线外一点，与本直线平行的直线
		return !isPoint2D(p) || o.hasPoint(p) ? undefined : CHIline2D(p, o.dv);
	}
	o.intersect = function(l) { //与另一直线的交点，如果平行则返回undefined
		if (!isLine2D(l) || o.parallel(l)) return undefined;
		var o = Equation21({
			a: o.a,
			b: o.b,
			c: o.c
		}, {
			a: l.a,
			b: l.b,
			c: l.c
		});
		return o ? CHIpoint2D(o) : undefined;
	}
	o.distance = function(P_L) { //求点到直线的距离，或平行线间的距离
		var a = o.a,
			b = o.b,
			c = o.c,
			m = module(a, b);
		if (isPoint2D(P_L)) { //点到直线的距离
			var pt = CHIpoint2D(p);
			return abs(a * pt.x + b * pt.y + c) / m;
		} else if (isLine2D(P_L) && o.parallel(P_L)) { //平行线间距离
			return abs(c - P_L.c) / m;
		}
		return undefined;
	}
	o.pedal = function(p) { //求过一点的垂足
		if (isPoint2D(p)) {
			var pt = CHIpoint2D(p);
			if (o.hasPoint(p)) return pt;
			var a = o.a,
				b = o.b,
				c = o.c,
				m = a * a + b * b,
				n = pt.x * a + pt.y * b + c,
				l = n / m;
			return CHIpoint2D(pt.x - a * l, pt.y - b * l);
		}
		return undefined;
	}
	o.theta = function(V_L) { //直线与直线或向量的夹角，在0~PI/2之间
		var v, dv = o.dv;
		if (isVector2D(V_L)) v = V_L;
		else if (isLine2D(V_L)) v = V_L.dv;
		else return undefined;
		var t = dv.theta(v);
		if (t > PI / 2) t -= PI / 2;
		return t;
	}
	o.constructor = CHIline2D;
	return o;
}
isLine2D = function(o) {
	return o.constructor == CHIline2D;
}

//抛物线，用来计算物理效果

function CHIparabola() {
	if (arguments.length < 1) return undefined;
	var arg = arguments,
		o = {};
	if (isArg(arg[0])) arg = arg[0];
	if (arg.length < 3) return undefined;

	function cal() { //计算判别式，极值点，根（与x轴交点）
		o.delta = o.d = o.b * o.b - 4 * o.a * o.c;
		//极值点
		var epx = -0.5 * o.b / o.a,
			epy = -0.25 * o.d / o.a;
		o.ep = o.extreme = CHIpoint2D(epx, epy);
		if (o.d >= 0) {
			if (o.d) {
				var rd = sqrt(o.d);
				var x1 = -0.5 * (o.b + rd) / o.a;
				var x2 = -0.5 * (o.b - rd) / o.a;
				o.root = [x1, x2];
			} else o.root = -0.5 * o.b / o.a;
		}
	}
	if (isPoint2D(arg[0]) && isPoint2D(arg[1]) && isPoint2D(arg[2]) && !isOnSameLine2D(arg[0], arg[1], arg[2])) { //使用三点初始化抛物线
		var p1 = CHIpoint2D(arg[0]),
			p2 = CHIpoint2D(arg[1]),
			p3 = CHIpoint2D(arg[2]);
		var o1 = {
			a: p1.x * p1.x,
			b: p1.x,
			c: 1,
			d: -p1.y
		},
			o2 = {
				a: p2.x * p2.x,
				b: p2.x,
				c: 1,
				d: -p2.y
			},
			o3 = {
				a: p3.x * p3.x,
				b: p3.x,
				c: 1,
				d: -p3.y
			};
		r = Equation31(o1, o2, o3);
		o.a = r.x;
		o.b = r.y;
		o.c = r.z;
		cal();
	} else if (!isNaN(arg[0]) && !isNaN(arg[1]) && !isNaN(arg[2])) { //使用abc初始化抛物线
		var a = float(arg[0]),
			b = float(arg[1]),
			c = float(arg[2]);
		if (!a) return undefined;
		o.a = a;
		o.b = b;
		o.c = c;
		cal();
	} else return undefined;

	o.toString = function() {
		return o.a + "*x*x + " + o.b + "*x + " + o.c + "=y"
	}
	o.getX = function(y) {
		y = float(y);
		var a = o.a,
			b = o.b,
			c = o.c,
			d = b * b - 4 * a * (c - y);
		if (d < 0) return undefined;
		else if (d == 0) return o.ep.x;
		else {
			var x1, x2
			x1 = (-b + sqrt(d)) / a * 0.5;
			x2 = (-b - sqrt(d)) / a * 0.5;
			return [x1, x2];
		}
	}
	o.getY = function(x) {
		x = float(x);
		return o.a * x * x + o.b * x + o.c;
	}
	o.hasPoint = function(p) {
		if (!isPoint2D(p)) return undefined;
		var pt = CHIpoint2D(p),
			x = pt.x;
		return fix(pt.y) == fix(o.a * x * x + o.b * x + o.c);
	}
	o.tangent = function(p) { //目前只求抛物线上的点的切线（即以导数为斜率的点斜式方程直线）
		if (!isPoint2D(p) || !o.hasPoint(p)) return undefined;
		var k = 2 * o.a;
		return CHIline2D(p, k);
	}
	o.constructor = CHIparabola;
	return o;
}
//圆类

function CHIcircle() {
	if (arguments.length < 1) return undefined;
	var arg = arguments,
		o = {};
	if (isArg(arg[0])) arg = arg[0];

	function cal() { //已知圆心及半径，求ab，def
		o.a = o.cp.x;
		o.b = o.cp.y;
		o.d = -2 * o.a;
		o.e = -2 * o.b;
		o.f = o.a * o.a + o.b * o.b - o.r * o.r;
	}

	function calABR() { //已知DEF，求ABR及圆心
		o.a = o.d / -2;
		o.b = o.e / -2;
		o.cp = o.center = CHIpoint2D(o.a, o.b);
		o.r = sqrt(o.d * o.d + o.e * o.e - 4 * o.f) / 2;
	}
	if (arg.length == 2) { //双参数
		var a = arg[0],
			b = arg[1];
		var isPa = isPoint2D(a),
			isPb = isPoint2D(b),
			isNa = !isNaN(a),
			isNb = !isNaN(b);
		if (isPa && isPb) { //两点做直径，构建圆
			var p1 = CHIpoint2D(a),
				p2 = CHIpoint2D(b);
			o.r = p1.distance(p2) / 2;
			o.cp = o.center = CHIpoint2D((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
			cal();
		} else if (isPa && isNb || isPb && isNa) { //中心点及半径，构建标准方程 (x-a)^2 + (y-b)^2 =0
			if (isPa) {
				o.cp = o.center = CHIpoint2D(a);
				o.r = float(b);
			} else {
				o.cp = o.center = CHIpoint2D(b);
				o.r = float(a);
			}
			cal();
		} else return undefined;
	} else if (arg.length == 3) { //三参数
		var d = arg[0],
			e = arg[1],
			f = arg[2];
		if (!isNaN(d) && !isNaN(e) && !isNaN(f)) { //三个数字，构建一般方程x^2 + y^2 + Dx + Ey + F =0
			d = float(d);
			e = float(e);
			f = float(f);
			if (d * d + e * e - 4 * f < 0) return undefined;
			o.d = d;
			o.e = e;
			o.f = f;
		} else if (isPoint2D(d) && isPoint2D(e) && isPoint2D(f) && !isOnSameLine2D(d, e, f)) { //三个不共线点，构建圆
			d = CHIpoint2D(d);
			e = CHIpoint2D(e);
			f = CHIpoint2D(f);
			var o1 = {
				a: d.x,
				b: d.y,
				c: 1,
				d: d.x * d.x + d.y * d.y
			},
				o2 = {
					a: e.x,
					b: e.y,
					c: 1,
					d: e.x * e.x + e.y * e.y
				},
				o3 = {
					a: f.x,
					b: f.y,
					c: 1,
					d: f.x * f.x + f.y * f.y
				};
			var r = Equation31(o1, o2, o3);
			if (r === undefined) return undefined;
			o.d = r.x;
			o.e = r.y;
			o.f = r.z;
		}
		calABR();
	} else if (isCircle(arg[0])) { //用圆构建圆
		var O = arg[0];
		o.a = O.a;
		o.b = O.b;
		o.r = O.r;
		o.d = O.d;
		o.e = O.e;
		o.f = O.f;
	} else return undefined;

	o.toString = function() { //返回一般方程
		return "x*x + y*y + " + o.d + "*x + " + o.e + "*y + " + o.f + " =0";
	}
	o.getX = function(y) {
		y = float(y);
		var o = {
			a: 1,
			b: o.d,
			c: y * y + o.e * y + o.f
		};
		return Equation12(o);
	}
	o.getY = function(x) {
		x = float(x);
		var o = {
			a: 1,
			b: o.e,
			c: x * x + o.d * x + o.f
		};
		return Equation12(o);
	}
	o.getPoint = function(t) {
		return {
			y: o.b + o.r * sin(t),
			x: o.a + o.r * cos(t)
		};
	}
	o.hasPoint = function(p) {
		if (!isPoint2D(p)) return undefined;
		var pt = CHIpoint2D(p);
		return fix(pow(pt.x - o.a, 2) + pow(pt.y - o.b, 2)) == fix(pow(o.r, 2));
	}
	o.getTheta = function() { //获取圆上一点所对的方向角，也就是向量（圆心到此点）的方向角；如果是双参则返回两点夹角（绝对值0~PI）
		var arg = arguments;
		if (arg.length == 1) {
			var p = arg[0];
			if (!o.hasPoint(p)) return undefined;
			var v = CHIvector2D(o.cp, p);
			return v.t;
		} else if (isPoint2D(arg[0]) && isPoint2D(arg[1])) {
			var p1 = arg[0],
				p2 = arg[1];
			if (!o.hasPoint(p1) || !o.hasPoint(p2)) return undefined;
			var v1 = CHIvector2D(o.cp, p1),
				v2 = CHIvector2D(o.cp, p2);
			return abs(v1.t - v2.t);
		}
		return undefined;
	}
	o.tangent = function(p) { //过一点求圆的切线，如果在圆上返回一个CHIline2D对象，如果圆外一点则返回两个对象的数组，在圆内则undefined
		if (!isPoint2D(p)) return undefined;
		var v = CHIvector2D(o.cp, p);
		if (o.hasPoint(p)) { //圆上一点，求半径向量，转90度后，返回点向式直线即切线
			v.rotate(90);
			return CHIline2D(p, v);
		} else { //圆外一点，“半径长”比“点到圆心向量的模”为“切线切点与圆心连结的半径”与“点心向量”所夹的角的余弦，用“点心向量的角度”与此角一加一减，可得两切点所在圆上的圆心角
			var t = acos(o.r / v.m);
			var t1 = v.t + t,
				t2 = v.t - t;
			var p1 = o.getPoint(t1),
				p2 = o.getPoint(t2);
			var l1 = CHIline2D(p, p1),
				l2 = CHIline2D(p, p2);
			return [l1, l2];
		}
	}
	o.constructor = CHIcircle;
	return o;
}

isCircle = function(o) {
	return o.constructor == CHIcircle;
}

//变形圆类///////////////////////////////////////这个先不要用
//function CHIcircleTransformed()
//{
//	if(arguments.length<1)return undefined;
//	var arg=arguments,o=this;
//	if(isArg(arg[0])) arg=arg[0];
//	function cal(){//已知圆心及半径，求ab，def
//		o.a=o.cp.x;
//		o.b=o.cp.y;
//		o.d=-2*o.a;
//		o.e=-2*o.b;
//		o.f=o.a*o.a + o.b*o.b - o.r*o.r;
//	}
//	function calABR(){//已知DEF，求ABR及圆心
//		o.a=o.d/-2;
//		o.b=o.e/-2;
//		o.cp=o.center=new CHIpoint2D(o.a,o.b);
//		o.r=sqrt(o.d*o.d + o.e*o.e - 4*o.f)/2;
//	}
//	if(arg.length==2)
//	{//双参数
//		var a=arg[0],b=arg[1];
//		var isPa=isPoint2D(a),isPb=isPoint2D(b),isNa=!isNaN(a),isNb=!isNaN(b);
//		if(isPa && isPb)
//		{//两点做直径，构建圆
//			var p1=new CHIpoint2D(a),p2=new CHIpoint2D(b);
//			this.r=p1.distance(p2)/2;
//			this.cp=this.center=new CHIpoint2D((p1.x+p2.x)/2,(p1.y+p2.y)/2);
//			cal();
//		}
//		else if(isPa && isNb || isPb && isNa)
//		{//中心点及半径，构建标准方程 (x-a)^2 + (y-b)^2 =0
//			if(isPa)
//			{
//				this.cp=this.center=new CHIpoint2D(a);
//				this.r=float(b);
//			}
//			else
//			{
//				this.cp=this.center=new CHIpoint2D(b);
//				this.r=float(a);
//			}
//			cal();
//		}
//		else return undefined;
//	}
//	else if(arg.length==3)
//	{//三参数
//		var d=arg[0],e=arg[1],f=arg[2];
//		if(!isNaN(d) && !isNaN(e) && !isNaN(f))
//		{//三个数字，构建一般方程x^2 + y^2 + Dx + Ey + F =0
//			d=float(d); e=float(e); f=float(f);
//			if(d*d + e*e - 4*f <0)return undefined;
//			this.d=d;
//			this.e=e;
//			this.f=f;
//		}
//		else if(isPoint2D(d) && isPoint2D(e) && isPoint2D(f) && !isOnSameLine2D(d,e,f))
//		{//三个不共线点，构建圆
//			d=new CHIpoint2D(d); e=new CHIpoint2D(e); f=new CHIpoint2D(f);
//			var o1={
//				a:d.x
//				,b:d.y
//				,c:1
//				,d:d.x * d.x + d.y * d.y
//			},o2={
//				a:e.x
//				,b:e.y
//				,c:1
//				,d:e.x * e.x + e.y * e.y
//			},o3={
//				a:f.x
//				,b:f.y
//				,c:1
//				,d:f.x * f.x + f.y * f.y
//			};
//			var r=Equation31(o1,o2,o3);
//			if(r===undefined)return undefined;
//			this.d=r.x;
//			this.e=r.y;
//			this.f=r.z;
//		}
//		calABR();
//	}
//	else if(isCircle(arg[0]))
//	{//用圆构建圆
//		copy(arg[0],this,"d,e,f");
//		calABR();
//	}
//	else return undefined;
//	
//	this.xScale=this.yScale=1;
//	this.xSkew=this.ySkew=0;
//	
//	this.toString=function(){//返回参数方程
//		var r=this.r,a=this.a,b=this.b,
//			t1=a+" + "+ r +"*cos(t)",
//			t2=b+" + "+ r +"*sin(t)";
//		return "x="+ t1 +" * "+ this.xScale +" + "+ t2 +" * "+ this.xSkew + '\n'
//			  +"y="+ t1 +" * "+ this.ySkew +" + "+ t2 +" * "+ this.yScale;
//	}
//	this.getPoint=function(t){
//		var t1=this.a + this.r * cos(t),
//			t2=this.b + this.r * sin(t);
//		return {
//			x:t1 * this.xScale + t2 * this.xSkew
//			,y:t1 * this.ySkew + t2 * this.yScale
//		};
//	}
//	this.hasPoint=function(p){//根据参数方程，逆解参数
//		if(!isPoint2D(p))return undefined;
//		var pt=new CHIpoint2D(p),x=pt.x,y=pt.y;
//		var o1={
//			a:this.xScale,
//			b:this.xSkew,
//			c:-x
//		},o2={
//			a:this.ySkew,
//			b:this.ySkale,
//			c:-y
//		};
//		var r=Equation21(o1,o2);
//		if(r===undefined)return false;
//		var t1=r.x,t2=r.y,ct=t1-this.a,st=t2-this.b;
//		return fix(module(ct,st))==fix(pow(this.r,2));
//	}
//	this.tangent=function(p){//先在正常的圆上求切线，然后再将切线做矩阵变换
//		if(!isPoint2D(p))return undefined;
//		var v=new CHIvector2D(this.cp,p),
//			m=this.xScale,n=this.yScale,
//			u=this.xSkew,v=this.ySkew;
//		if(this.hasPoint(p))
//		{//圆上一点，求半径向量，转90度后，返回点向式直线即切线
//			v.rotate(90);
//			var l=new CHIline2D(p,v);
//			l.scale(m,n).skewX(u).skewY(v);
//			return l;
//		}
//		else
//		{//圆外一点，"半径长"比"点到圆心向量的模"为"切线切点与圆心连结的半径"与"点心向量"所夹的角的余弦，用"点心向量的角度"与此角一加一减，可得两切点所在圆上的圆心角
//			var t=acos(this.r/v.m);
//			var t1=v.t+t, t2=v.t-t;
//			var p1=this.getPoint(t1),p2=this.getPoint(t2);
//			var l1=new CHIline2D(p,p1),l2=new CHIline2D(p,p2);
//			l1.scale(m,n).skewX(u).skewY(v);
//			l2.scale(m,n).skewX(u).skewY(v);
//			return [l1,l2];
//		}
//	}
//}
//
//isCircleTransformed=function(o){return o instanceof CHIcircleTransformed;}
//