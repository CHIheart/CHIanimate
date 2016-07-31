// 扩展JQ的特效
/*
元素复制闪烁效果，限制使用在IMG元素上
oOptions，参数配置集合对象，可以使用的键名有
	percentage，缩放度百分量，默认为20，正数为放大，负数为缩小
	duration，效果时间，默认为300，毫秒数
	offsetLeft，向左偏移，默认为0，不偏移时放大元素的中心与本体中心是一致的
	offsetTop，向上偏移，默认为0，不偏移时放大元素的中心与本体中心是一致的
	reverse，反向闪烁，默认为false，正常情况下是副本变淡，变形后消失，如果反向则副本先变成最终尺寸，再淡入变成本体的样子后消失
	behavior，行为，默认为default，执行一次形变闪烁，如果为loop则不断重复闪烁，如果为alternate则闪出后再闪入（或相反）循环
	delay，默认为0，当行为为loop或alternate时有效，为每一次闪烁的间隔时间毫秒数
	done，function，闪烁完成之后执行（如果循环的话，每闪烁一次就执行一次）
*/
$.fn.twinkle = function(oOptions) {
	if (this.get(0).tagName.toLowerCase() != 'img') return;
	if (!oOptions) oOptions = {};

	function isPos(n) {
		return !isNaN(n) && n * 1 > 0;
	}

	function isInt(n) {
		return !isNaN(n) && /^[\+\-]?[0]*[1-9][\d]*$/.test(n);
	}

	function isPosInt(n) {
		return !isNaN(n) && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}
	var percentage = oOptions.percentage ? oOptions.percentage : 20,
		duration = isPosInt(oOptions.duration) ? oOptions.duration : 300,
		offsetLeft = isInt(oOptions.offsetLeft) ? oOptions.offsetLeft : 0,
		offsetTop = isInt(oOptions.offsetTop) ? oOptions.offsetTop : 0,
		reverse = oOptions.reverse ? oOptions.reverse : false,
		behavior = oOptions.behavior ? oOptions.behavior : 'default',
		delay = isPosInt(oOptions.delay) ? oOptions.delay : 0;
	return this.each(function() {
		var offset = $(this).offset(),
			left = offset.left,
			top = offset.top,
			clone = $(this).clone(),
			width = $(this).width(),
			height = $(this).height(),
			WIDTH = width * (1 + percentage * 0.01),
			HEIGHT = height * (1 + percentage * 0.01),
			LEFT = left - width * percentage * 0.005 + offsetLeft,
			TOP = top - height * percentage * 0.005 + offsetTop,
			oldWidth = reverse ? WIDTH : width,
			oldHeight = reverse ? HEIGHT : height,
			oldLeft = reverse ? LEFT : left,
			oldTop = reverse ? TOP : top,
			newWidth = reverse ? width : WIDTH,
			newHeight = reverse ? height : HEIGHT,
			newLeft = reverse ? left : LEFT,
			newTop = reverse ? top : TOP,
			oldAlpha = reverse ? 0 : 1,
			newAlpha = reverse ? 1 : 0;

		clone.appendTo('body').css({
			position: 'absolute',
			width: oldWidth,
			height: oldHeight,
			left: oldLeft,
			top: oldTop,
			opacity: oldAlpha,
			visibility: 'visible'
		}).animate({
			width: newWidth,
			height: newHeight,
			left: newLeft,
			top: newTop,
			opacity: newAlpha
		}, duration, function() {
			$(this).remove();
			if ($.isFunction(oOptions.done)) oOptions.done();
		});
	});
}

/*
打字效果，暂时不支持带有HTML标签的文本
oOptions，参数配置对象，可以使用的键名有
	delay，每个字符的出现间隔时间，默认为30毫秒
	each，每打一个字的回调函数，参数是已打出的字符数，及刚刚打出的字符
	done，打完全部字的回调函数，参数是元素本身
*/
$.fn.typiest = function(oOptions) {
	if (!oOptions) oOptions = {};

	function isPosInt(n) {
		return !isNaN(n) && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}
	var delay = isPosInt(oOptions.delay) ? oOptions.delay : 30,
		each = $.isFunction(oOptions.each) ? oOptions.each : $.noop,
		done = $.isFunction(oOptions.done) ? oOptions.done : $.noop;
	return this.each(function() {
		var text = $(this).text(),
			n = 0,
			THIS = this;
		$(this).empty();
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = 0;
		}
		this.timer = setInterval(function() {
			var char = text.charAt(n),
				curText = $(THIS).text();
			$(THIS).text(curText + char);
			n++;
			each(n, char);
			if (n == text.length) {
				clearInterval(THIS.timer);
				THIS.timer = 0;
				done(THIS);
			}
		}, delay);
	});
}

/*
打散文字，将一纯文本容器元素中的每个字符，用相同的标签包裹住，一般为使用其它特效做准备
tagName，标签名，默认为span，最好使用行内标签，且不要受CSS的影响（从未被赋予样式的标签）
*/
$.fn.explode = function(tagName) {
	if (!tagName) tagName = 'span';
	return this.each(function() {
		var text = $(this).text(),
			str = [];
		$(this).empty();
		for (var n = 0; n < text.length; n++)
		str.push('<' + tagName + '>' + text.charAt(n) + '</' + tagName + '>');
		$(this).html(str.join(''));
	});
}
/*
波浪式元素动画，可以是一个主元素中的所有子元素，也可以是一大段纯文本中的文字
oOptions，配置参数集合对象，可以使用的键名有
	mode，必须，可以为'text'文本动画或'child'子元素动画
	tagName，用来包裹文本的标签名，或需要被执行动画的子元素标签名
	action，行为，默认为'come'字符或子元素入场，还可以为'leave'字符或子元素离场
	direction，方向，默认为'here'，字符或子元素从上方入场或离场就在本位置（逐个淡入淡出），还可以为'up''left''down''right''random'
	easing，舒缓函数，默认为'linear'
	duration，每个单位完成动画的时间，默认为500毫秒
	delay，每个单位之间执行动画的间隔时间（上个完到下个开始），默认为空，采用随机延迟
	times，偏离倍数，默认为1，偏离倍数越大，效果越明显
	each，function，每个元素执行完动作时的回调函数
	done，function，整个动作执行完毕时的回调函数
*/
$.fn.wave = function(oOptions) {
	if (!oOptions || !oOptions.mode) return this;

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n)
	}

	function rand(m, n) { //范围内的随机整数，若不指定范围，则取0-9内的随机数
		if (isNaN(m)) m = 0;
		if (isNaN(n)) n = 9;
		return Math.floor(Math.random() * (Math.max(m, n) - Math.min(m, n))) + Math.min(m, n);
	}
	var mode = oOptions.mode.toString().toLowerCase(),
		//如果有标签就直接用，如果没有，如果是文本动画则用span默认，如果是元素动画，则留空，后边会用.children()方法
		tagName = oOptions.tagName ? oOptions.tagName : (oOptions.mode == 'text' ? 'span' : ''),
		action = oOptions.action ? oOptions.action : 'come',
		direction = oOptions.direction ? oOptions.direction : 'up',
		easing = oOptions.easing ? oOptions.easing : 'linear',
		duration = isPos(oOptions.duration) ? oOptions.duration : 500,
		delay = isPos(oOptions.delay) ? oOptions.delay : 0,
		times = isPos(oOptions.times) ? oOptions.times : 1,
		eachFunction = $.isFunction(oOptions.each) ? oOptions.each : $.noop,
		doneFunction = $.isFunction(oOptions.done) ? oOptions.done : $.noop;

	return this.each(function() {
		var width = $(this).outerWidth() * times,
			height = $(this).outerHeight() * times,
			children;

		switch (mode) {
		case 'text':
			var text = $(this).text();
			$(this).explode(tagName);
			children = $(this).find(tagName);
			break;
		case 'child':
			if (tagName) children = $(this).find(tagName);
			else children = $(this).children();
			break;
		default:
			return $(this);
		}

		var oCssOut = {
			opacity: 0
		},
			oCssIn = {
				opacity: 1
			};
		switch (direction) {
		case 'down':
			oCssOut.top = height;
			oCssIn.top = 0;
			break;
		case 'left':
			oCssOut.left = -width;
			oCssIn.left = 0;
			break;
		case 'right':
			oCssOut.left = width;
			oCssIn.left = 0;
			break;
		case 'up':
			oCssOut.top = -height;
			oCssIn.top = 0;
			break;
		default:
			//case 'here':
			oCssOut.top = oCssIn.top = 0;
		}

		var oCss = oCssOut,
			oAnimate = oCssIn;
		if (action == 'leave') {
			oCss = oCssIn;
			oAnimate = oCssOut;
		}
		oCss.position = 'relative';

		var THIS = $(this).visible();
		children.each(function(ind, ele) {
			if (direction == 'random') {
				oCssIn = {
					left: 0,
					top: 0,
					opacity: 1
				};
				oCssOut = {
					opacity: 0,
					left: rand(-9, 9) * $(ele).width() * times,
					top: rand(-9, 9) * $(ele).height() * times
				};
				oCss = action == 'leave' ? oCssIn : oCssOut;
				oAnimate = action == 'leave' ? oCssOut : oCssIn;
				oCss.position = 'relative';
				$(ele).data('oAnimate', oAnimate);
			}
			$(ele).css(oCss);
			setTimeout(function() {
				if (direction == 'random') {
					oAnimate = $(ele).data('oAnimate');
					$(ele).removeData('oAnimate');
				}
				$(ele).animate(oAnimate, {
					duration: duration,
					easing: easing,
					done: function() {
						if (eachFunction) eachFunction(ind, ele);
						if (ind == children.length - 1) {
							if (mode == 'text') {
								THIS.empty();
								if (action == 'leave') THIS.visible(false);
								THIS.text(text);
							}
							doneFunction(THIS, children);
						}
					}
				});
			}, (delay ? delay * ind : rand(1, 99) * 10));
		});
	});
}
/*
类似wave的效果，在原地一跳一跳的样子
oOptions，配置参数集合对象，可以使用的键名有
	mode，必须，可以为'text'文本动画或'child'子元素动画
	tagName，用来包裹文本的标签名，或需要被执行动画的子元素标签名
	direction，方向，默认为'up'，还可以为'left''down''right'
	times，偏离倍数，默认为1，偏离倍数越大，效果越明显
	inOptions，outOptions，离开原位及回到原位的配置参数集合对象，可以使用的键名有
		easing，舒缓函数，默认为'linear'
		duration，每个单位完成动画的时间，默认为500毫秒
		delay，默认为0，在inOptions和outOptions中有不同的含义
				在out中的含义为一个单元开始离开，到下一个单元开始离开之间的间隔，可以为负
				在in中的含义为一个单元完成离开，到开始回归之间的间隔，只能为正
		each，function，每个元素执行完动作时的回调函数，参数是当前的元素
		done，function，整个动作执行完毕时的回调函数，参数是整体的元素
*/
$.fn.jump = function(oOptions) {
	if (!oOptions || !oOptions.mode) return this;

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n)
	}

	function isInt(n) {
		return !isNaN(n) && /^[\+\-]?[0]*[1-9][\d]*$/.test(n);
	}

	function rand(m, n) { //范围内的随机整数，若不指定范围，则取0-9内的随机数
		if (isNaN(m)) m = 0;
		if (isNaN(n)) n = 9;
		return Math.floor(Math.random() * (Math.max(m, n) - Math.min(m, n))) + Math.min(m, n);
	}
	var mode = oOptions.mode.toString().toLowerCase(),
		//如果有标签就直接用，如果没有，如果是文本动画则用span默认，如果是元素动画，则留空，后边会用.children()方法
		tagName = oOptions.tagName ? oOptions.tagName : (oOptions.mode == 'text' ? 'span' : ''),
		direction = oOptions.direction ? oOptions.direction : 'up',
		times = isPos(oOptions.times) ? oOptions.times : 1,
		inOptions = $.isPlainObject(oOptions.inOptions) ? oOptions.inOptions : {
			easing: 'linear',
			duration: 500,
			delay: 0,
			each: $.noop,
			done: $.noop
		},
		outOptions = $.isPlainObject(oOptions.outOptions) ? oOptions.outOptions : {
			easing: 'linear',
			duration: 500,
			delay: 0,
			each: $.noop,
			done: $.noop
		};
	if (!outOptions.easing) outOptions.easing = 'linear';
	if (!isPos(outOptions.duration)) outOptions.duration = 500;
	if (!isInt(outOptions.delay)) outOptions.delay = 0;
	if (!$.isFunction(outOptions.each)) outOptions.each = $.noop;
	if (!$.isFunction(outOptions.done)) outOptions.done = $.noop;
	if (!inOptions.easing) inOptions.easing = 'linear';
	if (!isPos(inOptions.duration)) inOptions.duration = 500;
	if (!isPos(inOptions.delay)) inOptions.delay = 0;
	if (!$.isFunction(inOptions.each)) inOptions.each = $.noop;
	if (!$.isFunction(inOptions.done)) inOptions.done = $.noop;

	return this.each(function() {
		var children, THIS = this;

		switch (mode) {
		case 'text':
			var text = $(this).text();
			$(this).explode(tagName);
			children = $(this).find(tagName);
			break;
		case 'child':
			if (tagName) children = $(this).find(tagName);
			else children = $(this).children();
			break;
		default:
			return $(this);
		}

		var oCssOut = {},
			oCssIn = {},
			staticLock = children.length,
			piLock = staticLock;

		children.each(function(ind, ele) {
			var width = $(ele).outerWidth() * times,
				height = $(ele).outerHeight() * times,
				delay = outOptions.delay;
			switch (direction) {
			case 'left':
				oCssOut.left = -width;
				oCssIn.left = 0;
				break;
			case 'right':
				oCssOut.left = width;
				oCssIn.left = 0;
				break;
			case 'down':
				oCssOut.top = height;
				oCssIn.top = 0;
				break;
			default:
				// case 'up':
				oCssOut.top = -height;
				oCssIn.top = 0;
			}

			setTimeout(function() {
				$(ele).css({
					position: 'relative'
				}).animate(oCssOut, outOptions.duration, outOptions.easing, function() {
					outOptions.each(ele);
					piLock--;
					if (!piLock) {
						outOptions.done(THIS);
						piLock = staticLock;
					}
				}).delay(inOptions.delay).animate(oCssIn, inOptions.duration, inOptions.easing, function() {
					inOptions.each(ele);
					piLock--;
					if (!piLock) {
						inOptions.done(THIS);
						if (mode == 'text') {
							$(this).parent().empty().text(text);
						}
					}
				});
			}, delay > 0 ? delay * ind : (staticLock - ind) * -delay);
		});
	});
}
/*
以下为常用的属性或样式的改变方法
CSS部分：visibility
DOM部分：checked，disabled
*/
$.fn.visible = function(bool) {
	var visibility = bool === undefined || bool ? 'visible' : 'hidden';
	return this.css('visibility', visibility);
}
$.fn.checked = function(bool) {
	bool = bool === undefined || bool ? true : false;
	return this.each(function(index, element) {
		element.checked = bool;
	});
}
$.fn.disabled = function(bool) {
	bool = bool === undefined || bool ? true : false;
	return this.each(function(index, element) {
		element.disabled = bool;
	});
}