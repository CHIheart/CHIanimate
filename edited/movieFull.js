/*
sJQcontainer，要使用本特效的容器的JQ选择器字符串
sJQkid，在$(sJQcontainer)基础上，使用find查找需要被滚动的整体部分的选择器字符串，默认为使用第一子元素
oControllers，Controllers控制器对象，可以使用的属性有
	.prev，向前播放的控制器的选择器字符串
	.next，向后播放的控制器的选择器字符串
	.indices，索引的选择器字符串（1/2/3/4/5...），索引的当前页码会被附加class="cur"
	.stop，停止的控制器的选择器字符串
	.start，开始的控制器的选择器字符串
oOptions，附加参数列表对象，可以使用的属性有
	.dir，为滚动方向，只可以为u/d/l/r
	.delay，为滚动时间间隔，默认为30，不为0，越大滚动越慢
	.mstop，鼠标指向时停止开关，默认为true
	.minLi，为最少的显示数量，如果少于这个数量就不执行特效，默认为1
	.auto，是否自动播放，默认为true
	.line，是否是排列成一行的，默认为false，显示成一张一张的样子，为true则按顺序排列（既从1到3的时候会经过2）
oCallbacks，回调函数列表对象，可以使用的属性有
	.init(oJQcontainer)，完成初始化时执行的函数，参数为容器的JQ对象
	.move(oJQaimKid)，每一次滚动时执行的函数，参数当前指示的子元素的JQ对象
如果生成有名对象的话，可以调用的方法有
	.on()，开始滚动，使用后，auto被设置为true
	.off()，停止滚动
	.run(ind)，播放到指定索引的位置
	.prev()，向前滚动一个
	.next()，向后滚动一个
	.size()，返回子元素个数
	.cur()，返回当前作为标志的子元素索引
*/
/*
sJQcontainer，要使用本特效的容器的JQ选择器字符串
sJQkids，在$(sJQcontainer)基础上，使用find查找需要被滚动的子元素的选择器字符串，默认为使用直接子元素
oControllers，Controllers控制器对象，可以使用的属性有
	.prev，向前播放的控制器的选择器字符串
	.next，向后播放的控制器的选择器字符串
	.indices，索引的选择器字符串（1/2/3/4/5...），索引的当前页码会被附加class="cur"
	.stop，停止的控制器的选择器字符串
	.start，开始的控制器的选择器字符串
oOptions，附加参数列表对象，可以使用的属性有
	.dir，为滚动方向，只可以为u/d/l/r
	.delay，为滚动时间间隔，默认为30，不为0，越大滚动越慢
	.mstop，鼠标指向时停止开关，默认为true
	.minLi，为最少的显示数量，如果少于这个数量就不执行特效，默认为1
	.auto，是否自动播放，默认为true
	.line，是否是排列成一行的，默认为false，显示成一张一张的样子，为true则按顺序排列（既从1到3的时候会经过2）
oCallbacks，回调函数列表对象，可以使用的属性有
	.init(oJQcontainer)，完成初始化时执行的函数，参数为容器的JQ对象
	.move(oJQaimKid)，每一次滚动时执行的函数，参数当前指示的子元素的JQ对象
如果生成有名对象的话，可以调用的方法有
	.on()，开始滚动，使用后，auto被设置为true
	.off()，停止滚动
	.run(ind)，播放到指定索引的位置
	.prev()，向前滚动一个
	.next()，向后滚动一个
	.size()，返回子元素个数
	.cur()，返回当前作为标志的子元素索引
*/


define(function(require,exports,module){
	var $=jQuery;
	return function CHImovieFull(sJQcontainer,sJQkids,oControllers,oOptions,oCallbacks)
	{
		function FIND(sJQ) {
			return sJQ && $(sJQ).size();
		}
		if (!FIND(sJQcontainer)) return;
		if (!oOptions) oOptions = {};
		if (!oControllers) oControllers = {};
		if (!oCallbacks) oCallbacks = {};

		function isPos(n) {
			return n && /^[\+]?[0]*[1-9][\d]*$/.test(n);
		}
		var oResult = {},
			oJQcontainer = $(sJQcontainer).eq(0),
			oJQkids = sJQkids ? oJQcontainer.find(sJQkids) : oJQcontainer.children(),
			timer = 0;

		var piTotal = piMaxLi = oJQkids.size();
		if (piTotal < 2) return; //如果子元素不到2个则不滚动

		var cDir = oOptions.dir && $.inArray(oOptions.dir.toLowerCase(), ["u", "d", "l", "r"]) >= 0 ? oOptions.dir.toLowerCase() : "l",
			piDelay = isPos(oOptions.delay) ? oOptions.delay : 3000,
			bMouseStop = "mstop" in oOptions ? !!oOptions.mstop : true,
			bAuto = "auto" in oOptions ? !!oOptions.auto : true,
			niCurrent = 0,
			niAimIndex = 0,
			bLine = oOptions.line ? !!oOptions.line : false,
			bLock = false;

		var sPosName,sZeroName;
		if (cDir == 'l' || cDir == 'r') {
			sPosName = "left";
			sZeroName = "top";
		} else {
			sPosName = "top";
			sZeroName = "left";
		}

		//调整子元素位置
		oJQkids.each(function(index, el) {
			var pos = bLine ? (index * 100)+'%' : (index ? "100%" : 0),
				z = bLine ? 0 : piTotal - index,
				obj = {};
			obj[sPosName] = pos;
			obj[sZeroName] = 0;
			obj.zIndex = z;
			$(this).css(obj);
		});

		function animateOver(){
			niCurrent = niAimIndex;
			bLock = false;
			if (bAuto) start();
			if (typeof oJQindices !== 'undefined') {
				oJQindices.eq(niCurrent).addClass('cur').siblings().removeClass("cur");
			}
		}

		oResult.show=function(n){
			if(bLock || n===niCurrent) return false;
			bLock = true;
			if(n===undefined) niAimIndex=niCurrent+1;
			else n=(n+piTotal)%piTotal;
			niAimIndex=n;
			stop();

			//如果排成一行
			if(bLine)
			{
				var delta = (niAimIndex - niCurrent),
					distance = (delta<0 ? "+":"-") + "=" + (Math.abs(delta)*100) + '%',
					obj={};
				obj[sPosName]=distance
				oJQkids.animate(obj,animateOver);
			}
			else//如果是散开的
			{
				var niLock = 2;
				//双置解锁
					cbfun = function(){
						niLock--;
						if(niLock) return;
						animateOver();
					},
					objCss={},
					objAnimate={};
				//下一帧入屏
				objCss.zIndex=2;
				objCss[sPosName] = "100%";
				objAnimate[sPosName] = 0;
				oJQkids.eq(niAimIndex).css(objCss).animate(objAnimate,function(){
					$(this).css("zIndex",1);
					cbfun();
				});
				objAnimate[sPosName]="-100%";
				//上一帧出屏
				oJQkids.eq(niCurrent).animate(objAnimate,function(){
					$(this).css('zIndex', 0);
					cbfun();
				});
			}
		}


		function start() {
			if (!timer) timer = setInterval(oResult.next, piDelay);
		}
		oResult.on = function() {
			bAuto = true;
			start();
		}

		function stop() {
			clearInterval(timer);
			timer = 0;
		}
		oResult.off = function() {
			stop();
			bAuto = false;
		}
		if (bMouseStop) oJQcontainer.mouseover(stop).mouseleave(function() {
			if (bAuto) start();
		});
		oResult.size = function() {
			return oJQkids.size();
		}
		oResult.prev = function() {
			if (bLock) return;
			stop();
			oResult.show(niCurrent-1);
		}
		oResult.next = function() {
			if (bLock) return;
			stop();
			oResult.show(niCurrent+1);
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
		oResult.show(0);
		if (oCallbacks.init) oCallbacks.init(oJQcontainer);
		return oResult;
	}
});
