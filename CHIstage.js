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
(function(){
	var sWays = 'fold-left,fold-right,fold-top,fold-bottom,fold-lefttop,fold-leftbottom,fold-righttop,fold-rightbottom,fold-vertical,fold-horizontal,slide-left,slide-right,slide-top,slide-bottom,slide-lefttop,slide-leftbottom,slide-righttop,slide-rightbottom,fade,shrink,static,toggle-left,toggle-right,toggle-top,toggle-bottom,toggle-lefttop,toggle-leftbottom,toggle-righttop,toggle-rightbottom',
		sEasings = 'swing,easeInQuad,easeOutQuad,easeInOutQuad,easeInCubic,easeOutCubic,easeInOutCubic,easeInQuart,easeOutQuart,easeInOutQuart,easeInQuint,easeOutQuint,easeInOutQuint,easeInSine,easeOutSine,easeInOutSine,easeInExpo,easeOutExpo,easeInOutExpo,easeInCirc,easeOutCirc,easeInOutCirc,easeInElastic,easeOutElastic,easeInOutElastic,easeInBack,easeOutBack,easeInOutBack,easeInBounce,easeOutBounce,easeInOutBounce';

	function random(sEnumString) {
		var array = sEnumString.split(','),
			length = array.length;
		return array[Math.floor(Math.random() * length)];
	}

	function opposite(string) {
		var str = string;
		if ($.inArray(str, ['fade', 'shrink', 'static']) < 0) {
			if (str.indexOf('left') > 0) str = str.replace('left', 'right');
			else str = str.replace('right', 'left');
			if (str.indexOf('top') > 0) str = str.replace('top', 'bottom');
			else str = str.replace('bottom', 'top');
		} else if (str == 'static') str = 'fade';
		//else str='static'
		return str;
	}
	
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
			oJQindices = false, //是否有索引控制器
			bLock = false; //播放状态的状态锁
		oResult.play = function(index) {
			if (bLock) return;
			var piLength = aScenes.length;
			index>=0 ? index%=piLength : index+=piLength;
			//同帧直接弹回
			if (niCurrent == index) return;
			bLock = true;
			piLock = 2;

			oJQindices.length && oJQindices.eq(index).addClass('cur').siblings().removeClass('cur');
			var sceneThis = aScenes[niCurrent],
				sceneNext = aScenes[index],
				bRewind = niCurrent > index;

			function nextStart() { //入场帧的开始动作
				piLock--;
				//完全解锁后（入场帧完成入场，出场帧完成出场）再开始
				if (!piLock) { //如果入场帧需要执行开始，则先开始，再解除播放锁
					niCurrent = index;
					if (sceneNext.startAfterIn) sceneNext.start(function() {
						//如果入场帧只需执行一次，则将自动start变量置否
						if (sceneNext.startOnce) sceneNext.startAfterIn = false;
						bLock = false;
						//执行播放后事件
						trigger("after",index);
					});
					else bLock = false;
				}
			}

			function InOut() {
				//入场帧可能不在舞台上，先判断节省模式，再判断ready然后入场
				if (sceneNext.saveAfterOut) sceneNext.on();
				sceneNext.show();
				if (sceneNext.readyBeforeIn) sceneNext.ready();
				//执行入场前事件
				trigger("before",index);
				sceneNext.runin(bRewind, nextStart);
				//出场帧出场，然后触发入场帧的开始动作，再判断出场帧的节省模式
				sceneThis.runout(bRewind, function() {
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
			return this;
		}

		oResult.push = function(oScene) {
			var ind = $.inArray(oScene, aScenes);
			if (ind == -1) aScenes.push(oScene);
			oScene.saveAfterOut = true;
			oScene.readyBeforeIn = true;
			oScene.startAfterIn = true;
			oScene.startOnce = true;
			oScene.stopBeforeOut = false;
			oScene.overBeforeOut = false;
			oScene.resetBeforeOut = false;
			oScene.stage = this;
			return this;
		}
		oResult.pull = function(oScene) {
			var ind = $.inArray(oScene, aScenes);
			if (ind >= 0) aScenes.splice(ind, 1);
			return this;
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
			return this;
		}
		oResult.start = function(fFun) {
			if (!inited) oResult.init();
			if (!aScenes.length) return;
			bLock = true;
			aScenes[0].on().show().ready(function() {
				aScenes[0].start(function() {
					trigger("after",0);
					bLock = false;
					if(aScenes[0].startOnce) aScenes[0].startAfterIn=false;
					if ($.isFunction(fFun)) fFun();
				});
			});
			return this;
		}
		oResult.next = function() {
			niCurrent!=aScenes.length-1 && oResult.play(niCurrent + 1);
			return this;
		}
		oResult.prev = function() {
			niCurrent && oResult.play(niCurrent - 1);
			return this;
		}
		oResult.wheel = function(bool) {
			$(document)[bool ? 'on' : 'off']('mousewheel', function(event) {
				event.preventDefault();
				oResult[event.deltaY > 0 ? "prev" : "next"]();
			});
			return this;
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
			return this;
		}
		oResult.locked = function() {
			return bLock;
		}
		oResult.lock = function(){
			bLock = true;
			return this;
		}
		oResult.unlock = function(){
			bLock = false;
			return this;
		}
		//设置索引，selector所对应的JQ集合将被作为控制stage播放的各个帧的触发键
		//被触发且正常播放的元素将被附加cur类
		oResult.indices=function(selector){
			if(!$(selector).length) return false;
			oJQindices = $(selector).click(function(event) {
				if($(this).hasClass('cur') || bLock) return true;
				var index=$(this).index();
				oResult.play(index);
				$(this).addClass('cur').siblings().removeClass('cur');
			});
			return this;
		}
		//事件对象，在指定位置处执行，不要放影响播放流程的函数
		var events/*={
			before:{
				index:[events...]
			},
			after:{}
		}*/;
		function setEvent(key,index,func,bOut){
			if($.inArray(key, ['before','after'])<0 || isNaN(index) || !$.isFunction(func)) return false;
			bOut=!!bOut;
			if(!bOut)
			{
				if(!events) events={};
				if(!events[key]) events[key]={};
				if(!events[key][index]) events[key][index]=[];
			}
			var funcs=events[key][index],
				posFun=$.inArray(func, funcs),
				hasFun=posFun>-1;
			//有才能出，无才能进
			hasFun==bOut && (
				bOut ?
				(
					funcs.splice(posFun,1),
					funcs.length==0 && delete(events[key][index])
				)
				: funcs.push(func)
			);
			funcs=null;
		}
		function trigger(key,index){
			console.warn('in trigger ',key,index);
			var es,e;
			if(events && events[key] && (es=events[key][index]))
			{
				for(var n in es)
				{
					e=es[n];
					console.log(e);
					$.isFunction(e) && e();
				}
			}
			es=e=null;
		}
		//在播放第index帧之前执行，在scene.runin之前执行
		oResult.before=function(index,func,bOut){
			setEvent("before",index,func,bOut);
			return this;
		}
		//在播放第index帧之后执行，在scene.start的回调中执行
		oResult.after=function(index,func,bOut){
			setEvent("after",index,func,bOut);
			return this;
		}
		return oResult;
	}
	window.CHIstage=CHIstage;
})();
