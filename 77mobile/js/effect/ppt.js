/*
sJQcontainer，要使用本效果的容器的JQ选择器字符串
sJQkids，在$(sJQcontainer)的基础上使用find找到应用效果的后代元素的选择器字符串，如果不规定，则使用children
oControllers，控制器列表对象，可以使用的属性有
	.prev，向前播放的控制器的选择器字符串
	.next，向后播放的控制器的选择器字符串
	.indices，索引的选择器字符串（1/2/3/4/5...），索引的当前页码会被附加class="cur"
	.stop，停止的控制器的选择器字符串
	.start，开始的控制器的选择器字符串
oOptions，附加参数列表对象，可以使用的属性有
	.delay，闪现的间隔时间，默认为3000毫秒
	.mstop，鼠标悬停是否停止播放，默认为true
	.auto，自动播放，默认为true
oCallbacks，回调函数列表对象，可以使用的属性有
	.init(oJQkid0)，初始化完成的回调函数，参数为第0个子元素
	.show(oJQkid_show)，显示完成时的回调函数，参数为刚被显示的内容
	.hide(oJQkid_hide)，隐藏完成时的回调函数，参数为刚被隐藏的内容
如果生成有名对象的话，可以调用的方法有
	.on()，开始滚动
	.off()，停止滚动
	.roll()，同方向转向，左右互转，或上下互转
	.prev()，向前滚动一个
	.next()，向后滚动一个
*/
function CHIppt(sJQcontainer, sJQkids, oControllers, oOptions, oCallbacks) {
	function FIND(sJQ) {
		return sJQ && $(sJQ).size();
	}
	if (!FIND(sJQcontainer)) return;
	if (!oOptions) oOptions = {};
	if (!oCallbacks) oCallbacks = {};
	if (!oControllers) oControllers = {};

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}

	var oResult = new Object(),
		oJQcontainer = $(sJQcontainer).eq(0),
		oJQkids = !sJQkids ? oJQcontainer.children() : oJQcontainer.find(sJQkids),
		piTotal = oJQkids.size();
	if (piTotal < 2) return; //只有一个子元素则无特效

	var niCurrent = 0,
		timer = 0,
		piDelay = isPos(oOptions.delay) ? oOptions.delay : 3000,
		bMouseStop = "mstop" in oOptions ? Boolean(oOptions.mstop) : true,
		bAuto = "auto" in oOptions ? oOptions.auto : true,
		niLock = 0;

	if (bMouseStop) oJQcontainer.mouseenter(stop).mouseleave(function() {
		if (bAuto) start();
	});
	oJQkids.not(":first-of-type").hide();
	oResult.show = function(index) {
		if (index == niCurrent || niLock) return;
		niLock = 2;
		stop();
		index += piTotal;
		index %= piTotal;
		if (typeof oJQindices !== 'undefined') {
			oJQindices.eq(niCurrent).removeClass('cur');
			oJQindices.eq(index).addClass('cur');
		}
		oJQkids.eq(index).fadeIn(function() {
			if (oCallbacks.show) oCallbacks.show(oJQkids.eq(index));
			niLock--;
			if (!niLock && bAuto) start();
		});
		oJQkids.eq(niCurrent).fadeOut(function() {
			if (oCallbacks.hide) oCallbacks.hide(oJQkids.eq(niCurrent));
			niLock--;
			if (!niLock && bAuto) start();
		});
		niCurrent = index;
	}
	oResult.prev = function() {
		if (niLock) return;
		stop();
		oResult.show(niCurrent - 1);
	}
	oResult.next = function() {
		if (niLock) return;
		stop();
		oResult.show(niCurrent + 1);
	}

	function start() {
		if (!timer) timer = setTimeout(oResult.next, piDelay);
	}
	oResult.on = function() {
		bAuto = true;
		start()
	}

	function stop() {
		clearTimeout(timer);
		timer = 0;
	}
	oResult.off = function() {
		bAuto = false;
		stop();
	}
	oResult.size = function() {
		return oJQkids.size();
	}

	if (FIND(oControllers.indices)) {
		var oJQindices = $(oControllers.indices);
		oJQindices.eq(0).addClass('cur');
		oJQindices.click(function() {
			oResult.show($(this).index(oControllers.indices));
		});
	}
	if (FIND(oControllers.prev)) $(oControllers.prev).click(oResult.prev);
	if (FIND(oControllers.next)) $(oControllers.next).click(oResult.next);
	if (FIND(oControllers.stop)) $(oControllers.stop).click(oResult.off);
	if (FIND(oControllers.start)) $(oControllers.start).click(oResult.on);

	if (bAuto) oResult.on();
	if (oCallbacks.init) {
		oCallbacks.init(oJQkids.eq(0));
	}
	return oResult;
}