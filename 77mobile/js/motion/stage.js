/*
以下属性将由舞台对象赋值给帧对象
	saveAfterOut = false,
	是否使用节省模式，非循环动画建议使用，出场的帧将被暂时移出文档，以节省资源
	readyBeforeIn = false,
	入场前执行准备动作
	startAfterIn = true,
	入场后执行开始动作
	startOnce = true,
	只执行一次开始动作
	stopBeforeOut = false,
	出场前执行停止动作
	overBeforeOut = false,
	出场前执行完成动作
	resetBeforeOut = false,
	出场前执行复位动作

*/

function CHIstage() {
	var aScenes = [],
		oResult = {
			inWay: '',
			//统一的入场方式，空为随机选取
			outWay: '',
			//统一的出场方式，空为按inWay方法取反
		},
		niCurrent = 0,
		piLock, //出入场的整数锁
		bLock = false; //播放状态的状态锁
	oResult.play = function(index) {
		if (bLock) return;
		var piLength = aScenes.length;
		index>=0 ? index&=piLength : index+=piLength;
		//同帧直接弹回
		if (niCurrent == index) return;
		bLock = true;
		piLock = 2;

		var sceneThis = aScenes[niCurrent],
			sceneNext = aScenes[index],
			inWay = this.inWay && (',' + sWays + ',').indexOf(',' + this.inWay + ',') >= 0 ? this.inWay : RandomString(sWays),
			outWay = this.outWay && (',' + sWays + ',').indexOf(',' + this.outWay + ',') >= 0 ? this.outWay : OppositeString(inWay);

		sceneThis.set('out', outWay);
		sceneNext.set('in', inWay);

		function nextStart() { //入场帧的开始动作
			piLock--;
			//完全解锁后（入场帧完成入场，出场帧完成出场）再开始
			if (!piLock) { //如果入场帧需要执行开始，则先开始，再解除播放锁
				niCurrent = index;
				if (sceneNext.startAfterIn) sceneNext.start(function() {
					//如果入场帧只需执行一次，则将自动start变量置否
					if (sceneNext.startOnce) sceneNext.startAfterIn = false;
					bLock = false;
				});
				else bLock = false;
			}
		}

		function InOut() {
			//入场帧可能不在舞台上，先判断节省模式，再判断ready然后入场
			if (sceneNext.saveAfterOut) sceneNext.on();
			sceneNext.show();
			if (sceneNext.readyBeforeIn) sceneNext.ready();
			sceneNext.runin(nextStart);
			//出场帧出场，然后触发入场帧的开始动作，再判断出场帧的节省模式
			sceneThis.runout(function() {
				nextStart();
				sceneThis[sceneThis.saveAfterOut ? 'off' : 'hide']();
			});
		}

		if (sceneThis.stopBeforeOut) { //出场帧，如果先stop，则继续判断over或reset，over优先
			sceneThis.stop(function() {
				if (sceneThis.overBeforeOut) sceneThis.over(InOut);
				else if (sceneThis.resetBeforeOut) sceneThis.reset(InOut);
				else InOut();
			});
		} else InOut();
	}

	oResult.push = function(oScene) {
		var ind = $.inArray(oScene, aScenes);
		if (ind == -1) aScenes.push(oScene);
		return oResult;
	}
	oResult.pull = function(oScene) {
		var ind = $.inArray(oScene, aScenes);
		if (ind >= 0) aScenes.splice(ind, 1);
		return oResult;
	}
	var inited = false;
	oResult.init = function() {
		if (inited) return;
		for (var n = 0; n < aScenes.length; n++) {
			aScenes[n].init();
			var behavior = aScenes[n].saveAfterOut ? 'off' : 'hide';
			aScenes[n][behavior]();
		}
		inited = true;
	}
	oResult.start = function(fFun) {
		if (!inited) oResult.init();
		if (!aScenes.length) return;
		bLock = true;
		aScenes[0].on().show().ready(function() {
			aScenes[0].start(function() {
				bLock = false;
				if ($.isFunction(fFun)) fFun();
			});
		});
	}
	oResult.next = function() {
		oResult.play(niCurrent + 1);
	}
	oResult.prev = function() {
		oResult.play(niCurrent - 1);
	}
	oResult.wheel = function(bool) {
		$(document)[bool ? 'on' : 'off']('mousewheel', function(event) {
			var delta = event.deltaY;
			if (delta > 0) oResult.prev();
			else oResult.next();
			event.preventDefault();
		});
	}
	oResult.key = function(bool) {
		$(document)[bool ? 'on' : 'off']('keyup', function(event) {
			var method = '';
			switch (event.which) {
			case 38:
				//上
			case 37:
				//左
			case 33:
				//PU
			case 219:
				//[
			case 188:
				//<
				method = 'prev';
				break;
			case 40:
				//下
			case 39:
				//右
			case 34:
				//PD
			case 221:
				//]
			case 190:
				//>
				method = 'next';
				break;
			default:return;
			}
			STAGE[method]();
		});
	}
	oResult.locked = function() {
		return bLock;
	}
	return oResult;
}