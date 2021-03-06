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
	//动画帧对象

	function isWay(way) {
		return (',' + sWays + ',').indexOf(',' + way + ',') >= 0;
	}

	function isEasing(easing) {
		return (',' + sEasings + ',').indexOf(',' + easing + ',') >= 0;
	}
	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n)
	}

	function CHIscene(sJQcontainer, oOptions) {
	/*
		出入场效果，每个都可以作为出场或入场的方式
		fold-*，单向收缩/展开效果，通过增减帧的尺寸达到
		slide-*，滑入测出效果，通过增减帧的定位属性达到
		toggle-*，滑动一半再滑回来，两个相反的toggle配合就会像抽走一张，拿出下一张的样子
		fade，原位淡入淡出效果
		shrink，向中心缩小或由中心扩张
		static，帧直接出现在屏幕的位置上，比较适合与fade或shrink配合，作为入场方式
		*/


		if (!$(sJQcontainer).size()) return false;
		if (!oOptions) oOptions = {};
		var defaultSettings={
			//每次切帧时的耗时（毫秒）
			duration:1e3,
			//本帧从前边帧入场的方式
			inFromPrevWay:'slide-left',
			inFromPrevEasing:'swing',
			//本帧从后边帧入场的方式
			inFromNextWay:'slide-left',
			inFromNextEasing:'swing',
			//本帧向前边帧出场的方式
			outToPrevWay:'slide-left',
			outToPrevEasing:'swing',
			//本帧向后边帧出场的方式
			outToNextWay:'slide-left',
			outToNextEasing:'swing'
		},
			aCollections = [],
			//本帧的动画集合，方便执行各动画的stop过程
			oJQscene = $(sJQcontainer),
			//帧的JQ对象
			piSceneWidth = oJQscene.outerWidth(),
			//帧的原始宽度（包括边框）
			piSceneHeight = oJQscene.outerHeight(),
			//帧的原始高度（包括边框）
			oJQstage = oJQscene.parent(),
			//舞台的JQ对象
			oResult = {};
		oResult.toString = function() {
			return oJQscene.selector;
		}
		

	/*
		设置上边的defaultSettings的键值
		可以使用"名称，值"双参数
		也可以使用键值对对象作为参数
		
		默认的变量设置，有利于做循环动作
		通过外部调用ready()，来使帧准备
		入场第一次，bStartAfterIn=true执行start()，然后bStartOnce=true使bStartAfterIn=false
		出场前bStopBeforeOut=false，所以不执行stop(),over(),reset()任何一个
		再次入场，bStartAfterIn=false，不执行start()，帧继续着出场前的状态（如果是循环的就一直循环着）
		只有在bStopBeforeOut=true时，bOverBeforeOut与bResetBeforeOut才有效，且此两者只有一个有效，前者优先
		
		在设置in跟out时，可以使用逗号连接入场方式跟easing方法，如果没有则按入场方式算，如果只改变easing的话可以使用逗号加easing，省略入场方式
		*/
		oResult.set = function() {
			var arg = arguments;
			switch (arg.length) {
			case 1:
				if ($.isPlainObject(arg[0])) $.extend(true, defaultSettings, arg[0]);
				break;
			case 2:
				if(arg[0] in defaultSettings) defaultSettings[arg[0]]=arg[1];
				break;
			}
			return oResult;
		}
		$.extend(true, defaultSettings, oOptions);
		oResult.set(oOptions);
		
		//默认用来衔接各个动作的最基本方法
		var defaultAction=function(fCallback) {
			if ($.isFunction(fCallback)) fCallback();
		};
		//初始化动作，正常情况下只执行一次
		oResult.init = defaultAction;
		//准备动作，通常全部为瞬间完成的方法
		oResult.ready = defaultAction;
		//停止动作，通常全部为瞬间完成的方法
		oResult.stop = defaultAction;
		//开始动作，在准备动作之后执行，通常为动画型方法
		oResult.start = defaultAction;
		//完成动作，在停止动作之后执行，通常为动画型方法
		oResult.over = defaultAction;
		//复位动作，在开始动作之后执行，通常为动画型方法
		oResult.reset = defaultAction;
		//将某个动作置为默认方法
		oResult.drop = function(action){
			action in oResult && (oResult[action]=defaultAction);
			return this;
		}

		function InOut(sWay, sEasing, bOut, fCallback) {
			if (!$.isFunction(fCallback)) fCallback = $.noop;
			var bLeft = sWay.indexOf('left') >= 0,
				bRight = sWay.indexOf('right') >= 0,
				bTop = sWay.indexOf('top') >= 0,
				bBottom = sWay.indexOf('bottom') >= 0,
				bVertical = sWay.indexOf('vertical') >= 0,
				bHorizontal = sWay.indexOf('horizontal') >= 0,
				bShrink = sWay == 'shrink',
				piDuration = defaultSettings.duration,
			oCss = {
				zIndex: bOut ? 2 : 1
			}, oAnimate = {};

			if (sWay.indexOf('fold') >= 0 || bShrink) { //折叠效果
				oJQscene.show().wrap("<div>");
				var oJQwrapper = oJQscene.parent(),
					oCssScene = {
						opacity: 1
					},
					oAnimateScene = {};
				oCss.opacity = oCssScene.opacity = 1;

				if (bVertical || bHorizontal || bShrink) { //双向折叠或原地收缩/扩张
					var halfLeft = piSceneWidth / 2,
						halfTop = piSceneHeight / 2;
					oCssScene.bottom = oCssScene.right = 'auto';
					if (bHorizontal || bShrink) {
						if (!bShrink) {
							oCss.top = oCssScene.top = 0;
							oCss.height = '100%';
						}
						oCss.left = bOut ? 0 : halfLeft;
						oCss.width = bOut ? '100%' : 0;
						oAnimate.width = bOut ? 0 : '100%';
						oAnimate.left = bOut ? halfLeft : 0;
						oCssScene.left = bOut ? 0 : -halfLeft;
						oAnimateScene.left = bOut ? -halfLeft : 0;
					}
					if (bVertical || bShrink) {
						if (!bShrink) {
							oCss.left = oCssScene.left = 0;
							oCss.width = '100%';
						}
						oCss.top = bOut ? 0 : halfTop;
						oCss.height = bOut ? '100%' : 0;
						oAnimate.height = bOut ? 0 : '100%';
						oAnimate.top = bOut ? halfTop : 0;
						oCssScene.top = bOut ? 0 : -halfTop;
						oAnimateScene.top = bOut ? -halfTop : 0;
					}
				} else { //单向折叠
					if (bLeft || bRight) {
						oCss.width = bOut ? '100%' : 0;
						oAnimate.width = bOut ? 0 : '100%';
						oCss.left = oCssScene.left = bLeft ? 0 : 'auto';
						oCss.right = oCssScene.right = bRight ? 0 : 'auto';
					} else {
						oCss.left = oCssScene.left = 0;
						oCss.right = oCssScene.right = 'auto';
						oCss.width = '100%';
					}
					if (bTop || bBottom) {
						oCss.height = bOut ? '100%' : 0;
						oAnimate.height = bOut ? 0 : '100%';
						oCss.top = oCssScene.top = bTop ? 0 : 'auto';
						oCss.bottom = oCssScene.bottom = bBottom ? 0 : 'auto';
					} else {
						oCss.top = oCssScene.top = 0;
						oCss.bottom = oCssScene.bottom = 'auto';
						oCss.height = '100%';
					}
				}

				var innerLock = 2;

				function fDone() {
					innerLock--;
					if (innerLock) return;
					bOut && oJQscene.hide();
					oJQscene.unwrap();
					oJQwrapper = null;
					fCallback();
				}
				oJQwrapper.css({
					position: 'absolute',
					overflow: 'hidden'
				}).css(oCss).animate(oAnimate, piDuration, 'linear', fDone);
				oJQscene.css(oCssScene).animate(oAnimateScene, piDuration, 'linear', fDone);

			} else if (sWay.indexOf('slide') >= 0) { //单向滑动
				oCss.left = oCss.right = oCss.top = oCss.bottom = 'auto';
				if (bLeft) {
					oCss.left = bOut ? 0 : '-100%';
					oAnimate.left = bOut ? '-100%' : 0;
				} else if (bRight) {
					oCss.left = bOut ? 0 : '100%';
					oAnimate.left = bOut ? '100%' : 0;
				}
				if (bTop) {
					oCss.top = bOut ? 0 : '-100%';
					oAnimate.top = bOut ? '-100%' : 0;
				} else if (bBottom) {
					oCss.top = bOut ? 0 : '100%';
					oAnimate.top = bOut ? '100%' : 0;
				}
				oCss.opacity = 1;
				oJQscene.show().css(oCss).animate(oAnimate, piDuration, sEasing, function() {
					if (bOut) oJQscene.hide();
					fCallback();
				});
			} else if (sWay.indexOf('toggle') >= 0) { //来回滑动
				oCss.left = oCss.top = 0;
				oCss.right = oCss.bottom = 'auto';
				oCss.opacity = 1;
				var oCss2 = {
					zIndex: bOut ? 1 : 2,
					opacity: 1,
					display: 'block'
				},
					oAnimate2 = {
						left: 0,
						top: 0
					};
				if (bLeft || bRight) oAnimate.left = bLeft ? '-55%' : '55%';
				if (bTop || bBottom) oAnimate.top = bTop ? '-55%' : '55%';
				oJQscene.show().css(oCss).animate(oAnimate, piDuration * 0.5, sEasing, function() {
					oJQscene.css(oCss2).animate(oAnimate2, piDuration * 0.5, sEasing, function() {
						if (bOut) oJQscene.hide();
						fCallback();
					});
				});
			} else { //其它单一的效果
				oCss.left = oCss.top = 0;
				oCss.right = oCss.bottom = 'auto';
				switch (sWay) {
				case 'fade':
					//淡入淡出的z轴与其它的相反
					oCss.zIndex = bOut ? 1 : 2;
					oCss.opacity = bOut ? 1 : 0;
					oAnimate.opacity = bOut ? 0 : 1;
					oJQscene.show().css(oCss).animate(oAnimate, piDuration, sEasing, function() {
						if (bOut) oJQscene.hide();
						fCallback();
					});
					break;
				case 'static':
					//静止的z轴处于最下
					oCss.zIndex = 0;
					oCss.opacity = 1;
					oJQscene[bOut ? 'hide' : 'show']().css(oCss);
					fCallback();
					break;
				}
			}
		}
		/*
		出入场动作，可以使用的参数有
		1.Bollean，反向进/出场（默认从前帧进为false，从后帧进为true）或出场目标（到之前帧为true，默认到之后帧为false）
		2.Function，回调函数
		*/
		//入场动作
		oResult.runin = function(bRewind,fCallback) {
			var sWay = defaultSettings[bRewind ? "inFromNextWay" : "inFromPrevWay"],
				sEasing = defaultSettings[bRewind ? "inFromNextEasing" : "inFromPrevEasing"];
			InOut(sWay, sEasing, false, fCallback);
		}
		//出场动作
		oResult.runout = function(bRewind,fCallback) {
			var sWay = defaultSettings[bRewind ? "outToPrevWay" : "outToNextWay"],
				sEasing = defaultSettings[bRewind ? "outToPrevEasing" : "outToNextEasing"];
			InOut(sWay, sEasing, true, fCallback);
		}
		//节省资源使用的上下舞台
		oResult.off = function() {
			oJQscene.detach();
			return oResult;
		}
		oResult.on = function() {
			oJQstage.append(oJQscene);
			return oResult;
		}
		oResult.show = function() {
			oJQscene.css({
				visibility: 'visible',
				display: 'block'
			});
			return oResult;
		}
		oResult.hide = function() {
			oJQscene.hide();
			return oResult;
		}
		oResult.constructor = CHIscene;
		return oResult;
	}
	window.CHIscene=CHIscene;
})();
