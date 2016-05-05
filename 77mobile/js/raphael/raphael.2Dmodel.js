// 基于Raphael.js的2D模型库
var GlobalPointR = 1,
	GlobalSkewXY = -0.354*2,
	GlobalSkewZY = 0.354,
	GlobalPerspective = -0.002;

function isModelPoint2D(o) {
	return o && o.data && o.data("model") == "CHI-2D" && O.data("shape") == "point";
}

function isPoint(p) {
	return isModelPoint2D(p) || isPoint2D(p);
}
//2D点对象，可以使用数学模型中的二维点对象，或直接使用xy坐标生成形状
Raphael.fn.point2D = function() {
	var arg = arguments;
	if (!isPoint2D(arg[0]) && arg.length < 2) return false;
	var point;
	if (isPoint2D(arg[0])) point = CHIpoint2D(arg[0]);
	else point = CHIpoint2D(float(arg[0]), float(arg[1]));
	return this.circle(point.x, point.y, GlobalPointR).data({
		model: 'CHI-2D',
		shape: 'point',
		point: point
	});
}
//2D线对象，可以使用两个数学模型中的二维点对象或2D模型点对象
Raphael.fn.line2D = function(point1, point2) {
	if (!isPoint(point1) || !isPoint(point2)) return false;
	var pStart, pOver;
	if (isPoint2D(point1)) pStart = CHIpoint2D(point1);
	else pStart = point1.data("point");
	if (isPoint2D(point2)) pOver = CHIpoint2D(point2);
	else pOver = point2.data("point");
	return this.path('M' + pStart.x + ',' + pStart.y + 'L' + pOver.x + ',' + pOver.y).data({
		model: 'CHI-2D',
		shape: 'line',
		point1: point1,
		point2: point2
	});
}
//在以下多个方法当中，数据点中有radius属性的话，如果此点不是起始或终止点（封闭图形无起始终止点），则会生成对应尺寸的圆角，正数顺时针，负数逆时针
//2D折线对象，可以使用多个二维点对象生成形状，如有非法参数则被忽略
Raphael.fn.polyline2D = function() {
	var arg = arguments;
	if (isArg(arg[0])) arg = arg[0];
	if (arg.length < 2) return false;
	var obj = this.aux2D.polyline(arg);
	return this.path(obj.path).data({
		model: 'CHI-2D',
		shape: 'polyline',
		points: obj.points
	});
}
//2D多边形对象，可以使用多个二维点对象生成形状，如有非法参数则被忽略
Raphael.fn.polygon2D = function() {
	var arg = arguments;
	if (arg.length < 2) return false;
	var obj = this.aux2D.polyline(arg);
	return this.path(obj.path + 'z').data({
		model: 'CHI-2D',
		shape: 'polygon',
		points: obj.points
	});
}
/*
2D正多边形对象，生成一个中心在原点，第一角朝向0度方向的原始正多边形
参数为
sides，边数，不小于3
radius，外接圆半径
corner，转角半径，默认为0，正数圆角向外，负数圆角向内
angle，初始偏角，默认为0，第一角朝向的方向，角度值
*/
Raphael.fn.isogon2D = function(sides, radius, corner, angle) {
	if (!("isogon" in this.ca)) {
		this.ca.isogon = function(sides, radius, corner, angle) {
			if (this.data('model') != 'CHI-2D' || this.data('shape') != 'isogon' || this.type != 'path') return false;
			var points = [],
				theta = a2t(360 / sides);
			for (var n = 0; n < sides; n++) {
				var ntheta = theta * n + a2t(angle),
					x = cos(ntheta) * radius,
					y = sin(ntheta) * radius,
					point = CHIpoint2D(x, y);
				if (corner) point.corner = corner;
				points.push(point);
			}
			var obj = this.paper.aux2D.polyline(points);
			return {
				path: obj.path + 'z'
			};
		}
	}
	if (!isPosInt(sides) || sides < 3 || !isPosInt(radius)) return false;
	if (!angle || !isInt(angle)) angle = 0;
	if (!corner || !isInt(corner)) corner = 0;
	return this.path('M0,0').data({
		model: 'CHI-2D',
		shape: 'isogon'
	}).attr({
		isogon: [sides, radius, corner, angle]
	});
}
/*
圆弧
参数为弧所占有圆的百分量，弧所在圆心为原点，起始点为三点位置
radius，弧所在圆的半径
percent，弧所占圆的百分量
type，默认为arc弧，还可以为bow弓形，sector扇形
angle，初始偏角，默认为0，起始角朝向的方向，角度值
*/
Raphael.fn.arc2D = function(type, radius, percent, angle) {
	if (!("arc" in this.ca)) {
		this.ca.arc = function(radius, percent, angle) {
			var shape = this.data('shape');
			if (this.data('model') != 'CHI-2D' || shape != 'arc' && shape != 'bow' && shape != 'sector' || this.type != 'path') return false;
			var theta = a2t(percent * 360 + angle),
				start = a2t(angle),
				x0 = cos(start) * radius,
				y0 = sin(start) * radius,
				x = cos(theta) * radius,
				y = sin(theta) * radius,
				large = percent > 0.5 ? 1 : 0,
				path = ['A', radius, ',', radius, ',0,', large, ',1,', x, ',', y];
			switch (type) {
			case 'bow':
				path.unshift('M' + x0 + ',' + y0);
				path.push('z');
				break;
			case 'sector':
				path.unshift('M0,0L' + x0 + ',' + y0);
				path.push('z');
				break;
			default:
				/*case 'arc'*/
				type = 'arc';
				path.unshift('M', x0, ',', y0);
			}
			return {
				path: path
			}
		}
	}
	if (!isPosInt(radius) || !isPos(percent)) return false;
	if (percent > 1) percent -= floor(percent);
	if (!type) type = 'arc';
	type = type.toLowerCase();
	if (type != 'bow' && type != 'sector') type = 'arc';
	if (!angle || !isInt(angle)) angle = 0;
	return this.path('M0,0').data({
		model: 'CHI-2D',
		shape: type
	}).attr({
		arc: [radius, percent, angle]
	});
}
/*
星形
参数为
angles，角数，大于3
radius1，外角与圆心的连线（外接圆半径）
radius2，内角与圆心的连线（内接圆半径）
corner1，外角圆角半径，默认为0，正数圆弧向外，负数向内
corner2，内角圆角半径，默认为0，正数圆弧向外，负数向内
angle，初始偏角，默认为0，第一角朝向的方向，角度值
*/
Raphael.fn.star2D = function(angles, radius1, radius2, corner1, corner2, angle) {
	if (!('star' in this.ca)) {
		this.ca.star = function(angles, radius1, radius2, corner1, corner2, angle) {
			if (this.data('model') != 'CHI-2D' || this.data('shape') != 'star' || this.type != 'path') return false;
			var points = [];
			for (var n = 0; n < angles * 2; n++) {
				var radius = n % 2 ? radius2 : radius1,
					corner = n % 2 ? corner2 : corner1,
					theta = a2t(180 / angles * n + angle),
					x = cos(theta) * radius,
					y = sin(theta) * radius,
					point = CHIpoint2D(x, y);
				if (corner) point.corner = corner;
				points.push(point);
			}
			var obj = this.paper.aux2D.polyline(points);
			return {
				path: obj.path + 'z'
			};
		}
	}
	if (!isPosInt(angles) || angles < 3 || !isPosInt(radius1) || !isPosInt(radius2)) return false;
	if (!isInt(corner1)) corner1 = 0;
	if (!isInt(corner2)) corner2 = 0;
	if (!isInt(angle)) angle = 0;
	return this.path('M0,0').data({
		model: 'CHI-2D',
		shape: 'star'
	}).attr({
		star: [angles, radius1, radius2, corner1, corner2, angle]
	});
}
/*
尖角气泡，参数为
angle，尖角尺寸，尖角90度向上或下开口，两端点离原点各(angle,angle)距离
width，气泡总宽，以尖角为轴，左右各一半
height，气泡高，不算尖角，只是气泡本身的高
corner，气泡圆角，默认为10，正数圆角向外，负数向内
popup，尖角的尖是否向上，默认为false，气泡在上尖角在下，否则气泡在下尖角在上
*/
Raphael.fn.bubble = function(angle, width, height, corner, popup) {
	if (!this.ca.bubble) {
		this.ca.bubble = function(angle, width, height, corner) {
			if (this.data('model') != 'CHI-2D' || this.data('shape') != 'bubble') return false;
			var popup = this.data('popup'),
				points = [CHIpoint2D(0, 0)],
				sign = popup ? -1 : 1,
				half = width / 2,
				y1 = angle * sign,
				y2 = (angle + height) * sign;
			points.push(CHIpoint2D(-angle, y1)); //尖角左端点
			var pointLB = CHIpoint2D(-half, y1),
				//气泡左下角
				pointLT = CHIpoint2D(-half, y2),
				//左上
				pointRT = CHIpoint2D(half, y2),
				//右上
				pointRB = CHIpoint2D(half, y1); //右下
			//各圆角，朝向改变时，sweep参数也要改变，所以要乘(-sign)
			if (corner) pointLB.corner = pointLT.corner = pointRT.corner = pointRB.corner = corner * -sign;
			points.push(pointLB, pointLT, pointRT, pointRB);
			points.push(CHIpoint2D(angle, angle * sign)); //尖角右端点
			var obj = this.paper.aux2D.polyline(points);
			return {
				path: obj.path + 'z'
			};
		}
	}
	if (!isPosInt(angle) || !isPosInt(width) || !isPosInt(height)) return false;
	if (!isInt(corner)) corner = 0;
	if (!popup) popup = 0;
	return this.path('M0,0').data({
		model: 'CHI-2D',
		shape: 'bubble',
		popup: popup
	}).attr({
		bubble: [angle, width, height, corner]
	});
}
/*
将路径以动画的形式画出来的效果，只应用于path类型的元素
使用本命令之后，可以拥有自定义属性 percentage:[from,to]
指的是本路径的百分量子路径，from及to都是0-1之间的数字
setOptions，配置参数集合对象，可以使用的键名有
from,to,duration,easing,done,reversed,erased,delay
erased，默认为false，如果为true则为路径消失效果
*/
Raphael.el.draw=function(setOptions){
	if(this.data("__drawing")) return this;
	if(!setOptions) setOptions={};
	var from=!isNaN(setOptions.from) ? setOptions.from : 0,
		to=!isNaN(setOptions.to) ? setOptions.to : 1,
		duration=!isNaN(setOptions.duration) ? setOptions.duration *1 : 1000,
		easing=setOptions.easing ? setOptions.easing : 'swing',
		done=$.isFunction(setOptions.done) ? setOptions.done : $.noop,
		reversed=setOptions.reversed ? true : false,
		erased=setOptions.erased ? true : false,
		delay=!isNaN(setOptions.delay) ? setOptions.delay *1 : 0
		;
	var paper=this.data("__drawing",true).paper,primary,terminal;
	if(!('percentage' in paper.ca)) 
	{
		paper.ca.percentage=function(from,to){
			from*=1, to*=1;
			from>1 && (from=1) || from<0 && (from=0);
			to>1 && (to=1) || to<0 && (to=0);
			if(this.type!='path') return false;
			if(!this.data('__pathstring')) this.data('__pathstring',this.attr('path'));
			var path=this.data('__pathstring'),
				length=Raphael.getTotalLength(path),
				subpath=from==to ? 'M0,0C0,0,0,0,0,0Z' : Raphael.getSubpath(path,length*Math.min(from,to),length*Math.max(from,to));
			return {path:subpath};
		}
	}
	erased && (
		reversed && (primary=[0,1],terminal=[0,0],true)
		|| (primary=[0,1],terminal=[1,1])
		,true
	) || (
		reversed && (primary=[1,1],terminal=[1,0],true)
		|| (primary=[0,0],terminal=[0,1])
	);
	var animation=Raphael.animation({'percentage':terminal},duration,easing,function(){
			done.call(this);
			this.removeData('__drawing');
		});
	return this.attr('percentage',primary)
		.animate(animation.delay(delay));
}
Raphael.st.draw=function(setOptions){
	this.forEach(function(ele){
		ele.draw(setOptions);
	});
	return this;
}

/*
使元素的盒中心沿路径动作
setOptions，参数配置集合对象，可以使用的键名有
	path，必需，可以是路径对象或路径串
	from，移动于路径的起始位置，0-1，默认为0
	to，移动于路径的终止位置，0-1，默认为1
	duration，动画耗时毫秒数，默认为1000（最好能为整除20的数字）
	easing，舒缓函数，默认为swing（由于Raphael的我还没研究明白，所以这里先只能用JQ的easing）
	done，回调函数，默认为空
	rotate，元素是否沿路径转角，默认为false
	offsetX，元素的横向偏移，默认为0，元素的矩形盒中心与路径对齐
	offsetY，元素的纵向偏移，同上
	angle，元素的起始转角，默认为0，可以与路径起始点对齐
	show，是否显示路径，默认为false，如果为true的话会边走边显示路径
	delay，延迟时间，默认为0
*/
Raphael.el.tour=function(setOptions){
	if(!setOptions.path)return false;
	if(this.data("__touring"))return this;
	var path=setOptions.path;
	path.type!='path' && (path=this.paper.path(path));
	var length=path.attr({
		percentage:[0,1]
	}).getTotalLength();
	if(!length) return false;
	var from=!isNaN(setOptions.from) ? setOptions.from : 0,
		to=!isNaN(setOptions.to) ? setOptions.to : 1,
		duration=!isNaN(setOptions.duration) ? setOptions.duration*1 : 1000,
		offsetX=!isNaN(setOptions.offsetX) ? setOptions.offsetX*1 : 0,
		offsetY=!isNaN(setOptions.offsetY) ? setOptions.offsetY*1 : 0,
		angle=!isNaN(setOptions.angle) ? setOptions.angle*1 : 0,
		easing=setOptions.easing ? setOptions.easing : 'swing',
		done=$.isFunction(setOptions.done) ? setOptions.done : $.noop,
		delay=!isNaN(setOptions.delay) ? setOptions.delay*1 : 0,
		rotate=setOptions.rotate ? true : false,
		showPath=setOptions.show ? true : false,
		THIS=this.data("__touring",true),
		bbox=this.getBBox(true),
		reversed=from>to;
	this.attr({
		transform:""
	});
	path.draw({
		duration:duration,
		easing:easing,
		from:from,
		to:to,
		reversed:reversed,
		delay:delay,
		done:function(){
			done.call(THIS);
			THIS.removeData('__touring');
		}
	}).onAnimation(function(){
		var pers=this.attr("percentage"),
			index=reversed ? pers[0] : pers[1],
			point=this.getPointAtLength(index * length);
		THIS.attr({
			transform:"T" + (-bbox.cx + offsetX + point.x) + ',' + (-bbox.cy + offsetY + point.y) + (rotate ? "R"+(point.alpha + angle):"")
		});
	});
	showPath && path.show();
	return this;
}
Raphael.st.tour=function(setOptions){
	this.forEach(function(ele){
		ele.tour(setOptions);
	});
	return this;
}


//辅助用函数
Raphael.fn.aux2D = {
	//2D圆角角形，使用三个点，及圆角半径生成形状，返回对象，对象的属性分别是两个计算圆角用的起止点
	corner: function(point1, point2, point3, radius) {
		if (!isPoint(point1) || !isPoint(point2) || !isPoint(point3) || !radius) return false;

		function get(p) {
			return isPoint2D(p) ? CHIpoint2D(p) : p.data("point");
		}
		var r = abs(radius),
			pa = get(point1),
			pb = get(point2),
			pc = get(point3),
			vBA = CHIvector2D(pb, pa),
			vBC = CHIvector2D(pb, pc),
			thetaB = vBA.theta(vBC),
			mod = r / tan(thetaB * 0.5),
			//要求的点M及N，与点B分别构成两个方向不同，但模相同的向量
			vBM = CHIvector2D(vBA.u(), mod),
			vBN = CHIvector2D(vBC.u(), mod),
			pm = vBM.end(pb),
			pn = vBN.end(pb);
		return {
			p1: pm,
			p2: pn
		};
	},
	//2D多点折线，使用多个点数据对象，返回路径串
	polyline: function(ps) {
		if (!ps.length) return false;
		var path = [],
			points = [];
		for (var n = 0; n < ps.length; n++) {
			var p = ps[n];
			if (isPoint(p)) points.push(p);
		}
		var len = points.length;
		for (var n = 0; n < len; n++) {
			var order = n ? 'L' : 'M',
				point;
			if (isPoint2D(points[n])) {
				point = CHIpoint2D(points[n]);
				if (points[n].corner) point.corner = points[n].corner;
			} else point = points[n].data('point');
			if (point.corner) {
				var prev = (n - 1 + len) % len,
					next = (n + 1) % len,
					r = point.corner,
					ps = this.corner(points[prev], point, points[next], r),
					sweep = r > 0 ? 1 : 0,
					p1 = ps.p1,
					p2 = ps.p2;
				path.push(order, fix(p1.x), ',', fix(p1.y), 'Q', point.x, ',', point.y, ',', fix(p2.x), ',', fix(p2.y));
			} else path.push(order, point.x, ',', point.y);
		}
		return {
			path: path.join(''),
			points: points
		};
	}
}
/*
loading的样子，一串圆由大变小，圆心在同一个圆上
RADIUS，大圆的圆心到每个小圆的圆心的距离（大圆半径）
radius，最大的小圆的半径
COUNT，大圆上预置的放置小圆的个数
count，实际显示出来的小圆的个数（不能大于COUNT）
start，默认为0，起始角，让loading转起来就改变此参数就可以了
reversed，默认为false，反转圆，生成逆时针的图形
	*****如果reversed=false，则图形增加start是正确的转向；如果reversed=true，则图形减少start是正确的转向
*/
Raphael.fn.loading = function(RADIUS, radius, COUNT, count, start, reversed) {
	if (!("loading" in this.ca)) {
		this.ca.loading = function(RADIUS, radius, COUNT, count, start, reversed) {
			if (this.data('model') != 'CHI-2D' || this.data('shape') != 'loading' || this.type != 'path' || !isPosInt(RADIUS) || !isPosInt(radius) || !isPosInt(COUNT) || !isPosInt(count) || COUNT < count) return false;
			if (isNaN(start)) start = 0;
			reversed = Boolean(reversed) || false;
			var path = [];
			for (var n = 0; n < COUNT; n++) {
				var sign = reversed ? n : COUNT - n,
					theta = a2t(360 / COUNT * sign + start),
					cx = cos(theta) * RADIUS,
					cy = sin(theta) * RADIUS,
					curRadius = radius / count * (count - n);
				if (!curRadius) break;
				path.push('M', cx + curRadius, ',', cy, 'A', curRadius, ',', curRadius, ',0,1,1,', cx + curRadius, ',', cy - 0.001);
			}
			return {
				path: path.join('')
			};
		}
	}
	return this.path('M0,0').data({
		model: 'CHI-2D',
		shape: 'loading'
	}).attr({
		loading: [RADIUS, radius, COUNT, count, start]
	});
}
/*
使路径闪现的淡出或淡入的效果
oOptions，配置参数集合对象，可以使用的属性有
	fadeOut，默认为true，是淡出效果，为false则是淡入效果
	scale，默认为2，是缩放倍数，1以上的是放大效果，0-1是缩小效果
	duration，默认为300毫秒，闪现所耗费的时间
	easing，默认为linear
	offsetX,offsetY，闪现内容的偏移，默认都为0
	done，闪现完成时的回调函数
	delay，延时毫秒数，默认为0
*/
Raphael.el.twinkle = function(oOptions) {
	if (this.type != 'path') return false;
	if (!oOptions) oOptions = {};
	var fadeOut = "fadeOut" in oOptions ? Boolean(oOptions.fadeOut) : true,
		scale = isPos(oOptions.scale) ? oOptions.scale : 2,
		duration = isPosInt(oOptions.duration) ? oOptions.duration : 300,
		easing = oOptions.easing ? oOptions.easing : 'linear',
		offsetX = isNaN(oOptions.offsetX) ? 0 : oOptions.offsetX,
		offsetY = isNaN(oOptions.offsetY) ? 0 : oOptions.offsetY,
		delay = isNaN(oOptions.delay) ? 0 : oOptions.delay;
	var oCopy = this.clone(),
		attrOut = {
			opacity: 0,
			transform: 'T' + offsetX + ',' + offsetY + 'S' + scale
		},
		attrIn = {
			opacity: 1,
			transform: 'T0,0S1'
		},
		animation=Raphael.animation((fadeOut ? attrOut : attrIn), duration, easing, function() {
			if (isFun(oOptions.done)) oOptions.done();
			oCopy.remove();
			oCopy = null;
		});
	oCopy.attr(fadeOut ? attrIn : attrOut).animate(animation.delay(delay));
	return this;
}
Raphael.st.twinkle = function(oOptions) {
	this.forEach(function(ele, ind) {
		ele.twinkle(oOptions);
	});
}
/*
将集合中的元素的路径合在一起（不进行任何运算）
返回一个新的路径，将原有的路径作为一个整体
*/
Raphael.st.joinPath = function(remove) {
	if (!remove) remove = false;
	var path = [],
		paper;
	this.forEach(function(ele, ind) {
		if (ele.type == 'path') path.push(ele.attr('path'));
		if (!paper) paper = ele.paper;
	});
	if (remove) this.remove();
	return paper.path(path.join(''));
}
/*
仿3D旋转的效果，使用角度值
在应用animate做动画效果之前，必须使用一次rotate方法来初始化定义rotate属性
*/
Raphael.el.rotateX = function(degree) {
	var THIS = this,
		paper = this.paper;
	if (!("rotateX" in paper.ca)) {
		paper.ca.rotateX = function(degree) {
			if (!degree || isNaN(degree)) degree = 0;
			if (!THIS.data('BasicMatrix')) THIS.data('BasicMatrix', THIS.matrix);
			var theta = a2t(degree),
				skewX = -GlobalSkewXY * sin(theta),
				scaleY = cos(theta) - GlobalSkewZY * sin(theta),
				matrix = THIS.data('BasicMatrix').clone();
			matrix.add(1, 0, skewX, scaleY, 0, 0);
			return {
				transform: matrix.toTransformString().toUpperCase()
			}
		}
	}
	return this.attr({
		rotateX: degree
	});
}
Raphael.el.rotateY = function(degree) {
	var THIS = this,
		paper = this.paper;
	if (!("rotateY" in paper.ca)) {
		paper.ca.rotateY = function(degree) {
			if (!degree || isNaN(degree)) degree = 0;
			if (!THIS.data('BasicMatrix')) THIS.data('BasicMatrix', THIS.matrix);
			var matrix = THIS.data('BasicMatrix'),
				rotate = matrix.split().rotate;
			matrix.rotate(-degree - rotate);
			return {
				transform: matrix.toTransformString()
			};
		}
	}
	return this.attr({
		rotateY: degree
	});
}
Raphael.el.rotateZ = function(degree) {
	var THIS = this,
		paper = this.paper;
	if (!("rotateZ" in paper.ca)) {
		paper.ca.rotateZ = function(degree) {
			if (!degree || isNaN(degree)) degree = 0;
			if (!THIS.data('BasicMatrix')) THIS.data('BasicMatrix', THIS.matrix);
			var theta = a2t(degree),
				skewY = GlobalSkewZY * sin(theta),
				scaleX = cos(theta) - GlobalSkewXY * sin(theta),
				matrix = THIS.data('BasicMatrix').clone();
			matrix.add(scaleX, skewY, 0, 1, 0, 0);
			return {
				transform: matrix.toTransformString().toUpperCase()
			}
		}
	}
	return this.attr({
		rotateZ: degree
	});
}
Raphael.el.translate3D=function(x,y,z){
	var THIS=this,
		paper=this.paper;
	if(!("translate3D" in paper.ca)){
		paper.ca.translate3D=function(x,y,z){
			if (!x || isNaN(x)) x = 0;
			if (!y || isNaN(y)) y = 0;
			if (!z || isNaN(z)) z = 0;
			if (!THIS.data('BasicMatrix')) THIS.data('BasicMatrix', THIS.matrix);
			var matrix = THIS.data("BasicMatrix").clone(),
				ratio = 1 / (y * GlobalPerspective + 1);
			matrix.add(ratio, 0, 0, ratio, x+GlobalSkewXY*y, z+GlobalSkewZY*y);
			return {
				transform: matrix.toTransformString().toUpperCase()
			}
		}
	}
	return this.attr({
		translate3D:[x,y,z]
	});
}
Raphael.el.translateX=function(x){
	if(!("translate3D" in this.paper.ca)) this.translate3D(0,0,0);
	return this.attr({
		translate3D:[x,0,0]
	});
}
Raphael.el.translateY=function(y){
	if(!("translate3D" in this.paper.ca)) this.translate3D(0,0,0);
	return this.attr({
		translate3D:[0,y,0]
	});
}
Raphael.el.translateZ=function(z){
	if(!("translate3D" in this.paper.ca)) this.translate3D(0,0,0);
	return this.attr({
		translate3D:[0,0,z]
	});
}