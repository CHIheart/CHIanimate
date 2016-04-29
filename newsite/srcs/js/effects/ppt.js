/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2016-04-25 14:13:27
 * @version $Id$
 */


define(function(require,exports,module){
	return function (sJQcontainer, sJQkids, oControllers, oOptions, oCallbacks) {
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
	};
});