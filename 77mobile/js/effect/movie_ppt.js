/*
幻灯片-电影联动效果
本函数需要引用movie.js及ppt.js
sJQppt，要使用的幻灯片效果的JQ选择器字符串
sJQmovie，要使用的电影效果的JQ选择器字符串
sJQkidsPPT，幻灯片效果的子元素集合JQ选择器字符串
sJQkidMovie，电影效果的子元素容器JQ选择器字符串
oControllers，控制器列表对象，可以使用的属性有
	.prev，向前播放的控制器的JQ选择器字符串
	.next，向后播放的控制器的JQ选择器字符串
	.indices，索引的JQstr（1/2/3/4/5...），索引的当前页码会被附加class="cur"
	.stop，停止的控制器的JQ选择器字符串
	.start，开始的控制器的JQ选择器字符串
oOptions，附加参数列表对象，可以使用的属性有
	.dir，在movie效果上的滚动方向，只可以为u/d/l/r
	.minLi，在movie效果上显示的最少数量，如果少于这个数量就不执行特效，默认为3
	.delay，为滚动时间间隔，默认为30，不为0，越大滚动越慢
	.mstop，鼠标指向时停止开关，默认为true
	.auto，是否自动播放，默认为true
	.sensi，灵敏度，禁止连续触发上/下播放事件的最短时间，默认为1000
*/
function movie_ppt(sJQppt, sJQmovie, sJQkidsPPT, sJQkidMovie, oControllers, oOptions) {
	function FIND(sJQ) {
		return sJQ && $(sJQ).size();
	}

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}

	if (!oOptions) oOptions = {};
	if (!sJQkidsPPT) sJQkidsPPT = '';
	if (!sJQkidMovie) sJQkidMovie = '';
	var piDelay = isPos(oOptions.delay) ? oOptions.delay : 3000,
		bMouseStop = "mstop" in oOptions ? Boolean(oOptions.mstop) : true,
		bAuto = "auto" in oOptions ? Boolean(oOptions.auto) : true,
		timer = 0,
		piMinLi = isPos(oOptions.minLi) ? oOptions.minLi : 3,
		cDir = oOptions.dir && (["u", "d", "l", "r"].indexOf(oOptions.dir) >= 0) ? oOptions.dir : "l",
		bLock = false,
		piSensitive = isPos(oOptions.sensi) ? oOptions.sensi : 1000;

	var oPPT = CHIppt(sJQppt, sJQkidsPPT, {}, {
		auto: false
	});
	var oMovie = CHImovie(sJQmovie, sJQkidMovie, {}, {
		minLi: piMinLi,
		dir: cDir,
		auto: false
	});

	if (oPPT.size() != oMovie.size()) return;

	var oResult = {},
		niCurrent = 0,
		piSize = oPPT.size();
	oResult.show = function(index) {
		if (bLock) return;
		bLock = true;
		setTimeout(function() {
			bLock = false
		}, piSensitive);
		stop();
		if (index === undefined) index = (niCurrent + 1) % piSize;
		else index = (index + piSize) % piSize;
		oPPT.show(index);
		oMovie.show(index);
		niCurrent = index;
		if (bAuto) oResult.on();
	}

	function stop() {
		clearTimeout(timer);
		timer = 0;
	}

	function start() {
		if (!timer) timer = setTimeout(oResult.next, piDelay);
	}
	oResult.on = function() {
		bAuto = true;
		start();
	}
	oResult.off = function() {
		bAuto = false;
		stop();
	}
	oResult.next = function() {
		if (bLock) return;
		stop();
		oResult.show(niCurrent + 1);
	}
	oResult.prev = function() {
		if (bLock) return;
		stop();
		oResult.show(niCurrent - 1);
	}
	$(sJQmovie).children(":only-child").children().click(function() {
		oResult.show($(this).index());
	});
	if (bMouseStop) $(sJQppt).add(sJQmovie).mouseenter(stop).mouseleave(function() {
		if (bAuto) start();
	});

	if (FIND(oControllers.indices)) {
		var oJQindex = $(oControllers.indices);
		var oJQindices = oJQindex.children();
		oJQindices.eq(0).addClass('cur');
		oJQindices.click(function() {
			oResult.show($(this).index());
		});
	}
	if (FIND(oControllers.prev)) $(oControllers.prev).click(oResult.prev);
	if (FIND(oControllers.next)) $(oControllers.next).click(oResult.next);
	if (FIND(oControllers.stop)) $(oControllers.stop).click(oResult.off);
	if (FIND(oControllers.start)) $(oControllers.start).click(oResult.on);

	if (bAuto) oResult.on();
	return oResult;
}