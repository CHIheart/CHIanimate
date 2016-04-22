/*
sMode，队列模式，默认为time以指定时间为顺序，还可以为percent以百分量时间为顺序
	time默认模式下，每个动作指定时间后加入队列，某个时间可有多个动作，当队列被执行时，到达指定的时间就会执行相应的动作
	percent模式下，先给队列指定总时间，再给每个动作指定在总时间的百分比位置，程序计算相应时间点来执行相应的动作
piMs，如果是percent模式的话，才读取本参数，代表的是从第1行为开始，到最后行为开始间隔的毫秒数
*/
function CHIqueue(sMode, piMs) {
	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n)
	}

	function isPer(n) {
		return n !== undefined && /^[\+]?(100|[0-9]{1,2})$/.test(n);
	}
	if (!Array.prototype.indexOf) //低端浏览器，没有Array.indexOf()函数
	Array.prototype.indexOf = function(ele) {
		for (var n = 0; n < this.length; n++)
		if (ele === this[n]) return n;
		return -1;
	}

	if (!sMode) sMode = 'time';
	sMode = sMode.toString().toLowerCase();
	sMode = sMode != 'percent' ? 'time' : 'percent';
	var oResult, iTotalMs /*total milliseconds*/
	, events = {
/*
			每个键值对说明如下（使用数组比较浪费资源）
			键名为代表时间的值
				如果是time模式下的话，键为表示毫秒的正整数值
				如果是percent模式下，键为0-100的整数值
			键值为一数组，存放在此刻执行的动画行为
			如果队列是循环的话，执行过后的行为不会被删除；默认的队列是非循环的
		*/
	};
	if (sMode == 'percent' && isPos(piMs)) iTotalMs = piMs;

	oResult = function() {
		try {
			for (var n in events) {
				var time = sMode == 'percent' ? n * iTotalMs * 0.01 : n;
				for (var x = 0; x < events[n].length; x++)
				setTimeout(events[n][x], time);
			}
		} catch (e) {
			console.log('出现异常！');
		}
	}

	function funLegal(fFun) {
		if (!fFun) return false;
		var con = fFun.constructor;
		return fFun && con && (con == CHIanimate || con == CHIqueue || con == Function);
	}

	function timeLegal(time) {
		return sMode == 'time' ? isPos(time) : isPer(time);
	}
	//在时间time处加入行为fFun，如果只使用一个键值对对象的话，则按连续插入events算
	oResult.insert = function(fFun, time) {
		var arg = arguments;
		if (arg.length == 1 && fFun instanceof Object) {
			function ins(aEvent, fFun) {
				if (aEvent.indexOf(fFun) < 0) aEvent.push(fFun);
			}
			for (var n in arg[0]) {
				if (!events[n]) events[n] = [];
				var eve = arg[0][n];
				if (eve instanceof Array) {
					for (var x = 0; x < eve.length; x++)
					ins(events[n], eve[x]);
				} else ins(events[n], eve);
			}
		} else if (arg.length == 2) {
			var fFun = arg[0],
				time = arg[1];
			if (!funLegal(fFun) || !timeLegal(time)) return oResult;
			if (!events[time]) events[time] = [];
			if (events[time].indexOf(fFun) < 0) events[time].push(fFun);
		}
		return oResult;
	}
	//在时间time处删除行为fFun，或删除本对象中所有的fFun（次参为true）
	oResult.remove = function(fFun, timeOrAll) {
		if (!funLegal(fFun) || timeOrAll !== true && !timeLegal(timeOrAll)) return oResult;
		if (timeOrAll === true) for (var n in events) {
			var index = events[n].indexOf(fFun);
			if (index >= 0) events[n].splice(index, 1);
		} else if (events[timeOrAll]) {
			var index = events[timeOrAll].indexOf(fFun);
			if (index >= 0) events[timeOrAll].splice(index, 1);
		}
		return oResult;
	}
	//将某个时间改变
	oResult.change = function(timeOld, timeNew) {
		if (!timeLegal(timeOld) || !timeLegal(timeNew) || !events[timeOld]) return oResult;
		if (!events[timeNew]) events[timeNew] = events[timeOld];
		else for (var n = 0; n < events[timeOld].length; n++)
		events[timeNew].push(events[timeOld][n]);
		delete(events[timeOld]);
		return oResult;
	}
	//清空所有行为
	oResult.empty = function() {
		events = {};
		return oResult;
	}
	oResult.constructor == CHIqueue;
	return oResult;
}
