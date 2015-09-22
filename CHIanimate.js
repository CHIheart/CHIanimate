(function() {
	//必须包含jQuery或Raphael之一
	var hasJQuery = typeof $ != 'undefined',
		hasRaphael = typeof Raphael != 'undefined';
	if (!hasJQuery && !hasRaphael) return false;
	if (hasRaphael) {
		//使单独元素可以使用集合的forEach方法
		Raphael.el.forEach = function(fun) {
			fun.call(this, this, 1);
		}
		//定义Raphael集合查找元素索引的方法
		Raphael.st.indexOf = function(element) {
			var index = -1;
			this.forEach(function(ele, ind) {
				if (element == ele) return (index = ind, false);
			});
			return index;
		}
		//定义一个Raphael元素的索引是0
		Raphael.el.indexOf = function() {
			return 0;
		}
	}
	//根据控制台不同显示错误信息

	function log(error) {
		typeof console != 'undefined' && console.log(error) && true || alert(error);
	}
	//是否为正整数

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n)
	}
	//如果是低端，则Array没有indexOf
	if (!Array.prototype.indexOf) Array.prototype.indexOf = function(n) {
		for (var x = 0; x < this.length; x++) if (n == this[x]) return x;
		return -1;
	}
/*
	合并JSON对象，首参为模板对象，后续可跟若干对象，至少要有四个参数————————不深拷贝
	如果bUpdate=true，则后续对象与模板对象的同名属性的值会被更新，否则保留模板属性值
	如果bAppend=true，则后续对象的新出现属性会被添加到模板属性中，否则只查看固有属性
	如果bUpdate和bAppend全为false则不进行任何操作
	*/
	//merge(template, multipleJSONs, bUpdate, bAppend)
	function merge() {
		var args = arguments,
			length = args.length;
		if (length < 4) return;
		var bUpdate = args[length - 2],
			bAppend = args[length - 1];
		if (!bUpdate && !bAppend) {
			log('merge的最后两个参数不能同时为false');
			return false;
		}
		var template = args[0];
		for (var n = 1; n < length - 2; n++) {
			var json = args[n];
			for (var x in json) {
				if (x in template && bUpdate || !(x in template) && bAppend) template[x] = json[x];
			}
		}
		return true;
	}

	function CHIanimate(actor, oAttrs_sAction, oOptions) {
		//包含JQ的话，可能是选择器或JQ对象或DOM对象，否则被视为Raphael对象
		var isJQ = false,
			isRaphael = false,
			object;
		function Judge(param){
			if(hasRaphael && param instanceof Object && param.toString().indexOf("Rapha") === 0)
			{//使用Raphael的Element对象或Set对象
				object = param;
				return true;
			}
			else if (hasJQuery && (typeof param == 'string' || param instanceof $ || param instanceof Object))
			{//使用JQ对象，DOM对象，或JQ选择器字符串
				isJQ = true;
				object = $(param);
				return true;
			}
			return false;
		}
		
		if (!Judge(actor)) {
			log("首参必须使用\n1.Raphael对象或集合\n2.JQ对象或选择器\n3.DOM对象");
			return false;
		}
		var oResult,
		//生成的结果
		nexts = [],
			//后续动画，可以是由本方法生成的实例，或普通Function实例
			follows = [],
			//前导动画，可以是由本方法生成的实例，或普通Function实例
			events = {
/*
				每个键值对都是一个描述条件的表达式及行为数组
				形式为："slope,intercept":[]
				键名为"slope,intercept"，分别代表表达式的系数及常数项
				其中：slope（斜率：表达式系数，全体整数）
					 intercept（截距：表达式常数项，全体整数）
				键值为存放事件处理函数的数组
				*****斜率跟截距不可同时为零或负（一负一零也不行），当只有一个值时，被视为截距，事件只触发一次然后被删除
			*/
			},
			oBasicOptions = {},
			//基础配置
			niBasicPreLock = 0,
			//基础前置锁
			niPrevLock = 0,
			//前置计数锁
			niBasicInsideLock = isJQ || object.type == 'set' ? object.length : 1,
			//基础内置锁
			niInsideLock = niBasicInsideLock,
			//内置计数锁
			niCounter = 0;
		//静态计数器

		//允许初始化设置
		oOptions instanceof Object && merge(oBasicOptions, oOptions, true, true);
/*
		允许执行更改设置，当前置锁解除的时候，才会执行（即前置到了最后一步）
		bMerge默认为false，即执行时的设置是额外设置
		bMerge为true时，此时执行时的设置会附加到基础设置当中，但不会影响基础设置
		*/
		oResult = function(oNewOptions, bMerge) {
			niPrevLock--; //只有前置锁解除之后，才会执行本对象中的行为
			if (niPrevLock > 0) return oResult;
			niPrevLock = niBasicPreLock;
			niCounter++;

			//最终配置参数集合，如果并入新配置，则将新配置及基础配置并入最终配置，否则只使用新配置，没有新配置使用基础配置
			var oFinalOptions = {};
			oNewOptions instanceof Object && (
				bMerge && merge(oFinalOptions, oBasicOptions, oNewOptions, true, true) || merge(oFinalOptions, oNewOptions, true, true)
			) || merge(oFinalOptions, oBasicOptions, true, true);

			var b = oAttrs_sAction instanceof Object,
				delay = oFinalOptions.delay || 0;
			delay instanceof Function && (delay = delay(object.length));

			var done = oFinalOptions.done ? oFinalOptions.done : $.noop,
				each = oFinalOptions.each ? oFinalOptions.each : $.noop;
			
			oFinalOptions.done = function(para) {
				var oMe = this,
					indexMe = isJQ ? object.index(this) : object.indexOf(this);
				each.call(this, indexMe);
				niInsideLock--; //只有内置锁解除后才可以执行最终的回调函数
				if(niInsideLock) return;

				done.call(object, niCounter);
				for (var nums in events) {
/*
						斜率与截距遵循CSS3表达式选择器的规则
						an+b=y(n=1,2...)
						当y>=0时才有效，所以ab不能同时为负或零（一负一零也不行）
					*/
					var ns = nums.split(','),
						two = ns.length == 2,
						//是否有两个参数，只有一个参数时被视为b
						a = two ? ns[0] * 1 : 0,
						b = ns[two ? 1 : 0] * 1,
						y = niCounter;
					if (!a && b == y || a && y + b >= 0 && (y - b / a) >= 0) {
						for (var x = 0; x < events[nums].length; x++) events[nums][x](niCounter);
						//删除固定序号及负系数到达上限的元素，以节省资源
						if (!a && b == y || a < 0 && y >= b) delete(events[nums]);
					}
				}
				oResult.next();
				niInsideLock = niBasicInsideLock;
			}
			object[isJQ ? 'each' : 'forEach'](function(para1, para2) {
				var oThisOption = {};
				isJQ ? (indexMe = para1, oMe = para2) : (indexMe = para2, oMe = para1);
				for (var n in oFinalOptions) { //计算独立设置集合，要把done、each、delta、step排除在计算之外，直接赋值
					var x = oFinalOptions[n];
					if (x instanceof Function && $.inArray(n, 'done,each,delta,step'.split(',')) == -1) x = x.call(oMe, indexMe);
					oThisOption[n] = x;
				}
				//如果delta是数字，则自动与索引正向或反向相乘，如果是函数，则直接获取函数返回值
				var delta = oThisOption.delta || 0;
				if (delta instanceof Function) delta = delta.call(oMe, indexMe);
				else delta *= delta > 0 ? indexMe : (indexMe - niBasicInsideLock + 1);
				if (b) {
					var oThisAttrs = {};
					for (var n in oAttrs_sAction) { //计算独立属性集合
						var x = oAttrs_sAction[n];
						if (x instanceof Function) x = x.call(oMe, indexMe);
						oThisAttrs[n] = x;
					}
					if (isJQ) $(oMe).delay(delta + delay).animate(oThisAttrs, oThisOption);
					else { //Raphael的animate没有缩合形式，而且step函数要以onAnimation的形式写入
						var Animation = Raphael.animation(oThisAttrs, oThisOption.duration, oThisOption.easing, oThisOption.done);
						if (oThisOption.step instanceof Function) oMe.onAnimation(function() {
							oThisOption.step.call(this);
						});
						oMe.animate(Animation.delay(delta + delay));
					}
				} else $(oMe)[oAttrs_sAction](oThisOption);
			});
			return oResult;
		}
/*
		允许另行更改设置
		bReset默认为false，将此时的设置合并到基础设置当中
		bReset为true时，用此时的设置，替换基础设置
		*/
		oResult.set = function(oNewOptions, bReset) {
			if (oNewOptions instanceof Object) {
				if (bReset) oBasicOptions = {};
				merge(oBasicOptions, oNewOptions);
			}
			return oResult;
		}
		oResult.delay = function(piMilliseconds) {
			if (isPos(piMilliseconds)) oBasicOptions.delay = piMilliseconds;
			return oResult;
		}
		oResult.duration = function(piMilliseconds) {
			if (isPos(piMilliseconds)) oBasicOptions.duration = piMilliseconds;
			return oResult;
		}
		oResult.change = function(param){
			if (!Judge(param)) {
				log("首参必须使用\n1.Raphael对象或集合\n2.JQ对象或选择器\n3.DOM对象");
				return false;
			}
			return oResult;
		}
		oResult.destroy = function(){
			oResult = null;
		}
/*
		前置后续共用的事件进出方法
		array，为nexts或follows数组指针
		arg，为四个公有方法的arguments对象指针
		bInput，为true则是堆入行为，为false则是删除行为
		*/
		function funIO(array, arg, bInput) {
			if (!arg.length) return oResult;
			var bNext = array == nexts;
			for (var n = 0; n < arg.length; n++) {
				var o = arg[n];
				switch (o.constructor) {
				case CHIanimate:
					var x = array.indexOf(o);
					//堆入行为，且行为未被堆入时
					if (bInput && x < 0) {
						array.push(o);
						if (bNext) o.follow(oResult);
						else o.lead(oResult);
					}
					//移除行为，且行为未被移除时
					else if (!bInput && x >= 0) {
						array.splice(x, 1);
						if (bNext) o.nofollow(oResult);
						else o.nolead(oResult);
					}
					break;
				}
			}
			return oResult;
		}
/*
		行为堆入，可堆入animate对象，或一般的function对象
		堆入的对象可以是使用set方法返回的修改过后的animate对象
		不可重复堆入同一行为
		*/
		oResult.lead = function() {
			return funIO(nexts, arguments, true);
		}
		//后续行为的删除方法
		oResult.nolead = function() {
			return funIO(nexts, arguments, false);
		}
/*
		前置堆入，当所有的前置都完成之后，本效果才会执行
		每堆入一个前置，前置锁都加1，当前置完成后，每调用一次本效果的执行部分，前置锁就会减1
		本方法会把本对象push到所follow的对象中
		不可重复跟踪同一事件
		*/
		oResult.follow = function() {
			return funIO(follows, arguments, true);
		}
		//前置行为的删除方法
		oResult.nofollow = function() {
			return funIO(follows, arguments, false);
		}
/*
		执行后续行为
		默认bForce=false，如果内置锁还在，则不执行，以免误操作
		当bForce=true时，则不管内置锁，强制执行后续行为
		*/
		oResult.next = function(bForce) {
			if (bForce || niInsideLock <= 0) {
				for (var n = 0; n < nexts.length; n++)
				nexts[n]();
			}
		}
		//动画终止，参数的含义与$.stop的相同
		oResult.stop = function(b1, b2) {
			object.stop(b1, b2);
			return oResult;
		}
		oResult.toString = function() {
			return 'CHIanimate Object';
		}
		//增加计数器事件
		//在第n次执行完之前（包含第n次执行完毕），每次都执行
		oResult.before = function(n, oCHIanimate, bOut) {
			return oResult.when(-1, n, oCHIanimate, bOut);
		}
		//在第n次执行完之后（包含第n次执行完毕），每次都执行
		oResult.after = function(n, oCHIanimate, bOut) {
			return oResult.when(1, n, oCHIanimate, bOut);
		}
		//在与第n次同时执行
		oResult.at = function(n, oCHIanimate, bOut) {
			return oResult.when(0, n, oCHIanimate, bOut);
		}
		//每n次执行一次
		oResult.each = function(n, oCHIanimate, bOut) {
			return oResult.when(n, 0, oCHIanimate, bOut);
		}
/*
		符合an+b公式的次数时执行，n=1,2,3...，当公式值为正整数时有效，与CSS3的nth-of-type中使用的表达式意义相同
		只处理CHIanimate或CHIqueue对象，或一般的Function对象，当bOut=true时，删除指定的行为
		*/
		oResult.when = function(a, b, oCHI, bOut) {
			var con;
			if (!oCHI || (con = oCHI.constructor) && con != CHIanimate && con != Function || (a = a * 1, b = b * 1) && (isNaN(a) || isNaN(b) || a <= 0 && b <= 0)) return oResult;
			var key, A = Math.abs(a);
			//最后一个条件，无法得到非负整数项
			if (a < 0 && b < A) return oResult;
			//系数a为0，正数常量（前边已经抛掉了a=0&&b<=0的情况）就代表对应的次数，执行一次，创建键名"b"
			if (!A) key = b.toString();
			//此种情况，任何集合都由最小的正整数开始，将an+b中的常数项b，整理成不大于系数|a|的非负整数，以重复利用相同集合的键值
			else if (a > 0 && b < 0) {
				while (b < 0) b += A;
				key = a + ',' + b;
			}
			//其它情况a!=0&&b>0，常量决定了不同的集合
			else key = a + ',' + b;
			if (!events[key]) { //不存在的键，删则直接返回，添则增加新键值为数组
				if (bOut) return oResult;
				else events[key] = [];
			}
			var arr = events[key];
			for (var n = 0; n < arr.length; n++) { //因为只删除一个，所以不用倒序
				if (arr[n] == oCHI) {
					//如果找到参数的话，要删除则直接删除，要添加就直接忽略
					if (bOut) arr.splice(n, 1);
					return oResult;
				}
			}
			//要添加，且没有找到参数，则入栈
			!bOut && arr.push(oCHI);
			return oResult;
		}
		//删除所有事件中的指定行为
		oResult.remove = function(oCHI) {
			var con = oCHI.constructor;
			if (!con || con != CHIanimate && con != CHIqueue && !(con == Function)) return oResult;
			//因为要删除所有的，所以要倒序
			for (var x in events) {
				var arr = events[x];
				for (var n = arr.length - 1; n >= 0; n--)
				if (arr[n] == oCHI) arr.splice(n, 1);
			}
			return oResult;
		}
/*
		复制对象
		如果bDeep=true的话，连前后续行为及事件都复制
		bDeep也可以为对象，单独控制复制操作，可以使用的属性有
			events,nexts,follows，为true则复制指定的数据
		*/
		oResult.clone = function(bDeep) {
			var newObj = CHIanimate(sJQorObj, oAttrs_sAction, oBasicOptions);
			if (bDeep) {
				function copy(array) {
					var fun;
					if (array == events) { //事件的处理方式与其它两项不同
						for (var n in array) {
							if (n.indexOf(',') >= 0) { //公式形式
								var arr = n.split(',');
								for (var x = 0; x < array[n].length; x++)
								newObj.when(arr[0], arr[1], array[n][x]);
							} else { //单次形式
								for (var x = 0; x < array[n].length; x++)
								newObj.at(n, array[n][x]);
							}
						}
					} else { //前置及后续是普通的数组
						switch (array) {
						case nexts:
							fun = 'lead';
							break;
						case follows:
							fun = 'follow';
							break;
						}
						if (fun) for (var n = 0; n < array.length; n++)
						newObj[fun](array[n]);
					}
				}
				if (bDeep === true) { //只写true的时候，复制所有
					copy(events);
					copy(nexts);
					copy(follows);
				} else { //否则按对象的键值进行复制
					if (bDeep.events) copy(events);
					if (bDeep.nexts) copy(nexts);
					if (bDeep.follows) copy(follows);
				}
			}
			return newObj
		}
		oResult.constructor = CHIanimate;
		return oResult;
	}
	window.CHIanimate = CHIanimate;
})();

/*
sJQorObj，要执行效果的选择器，至少要符合一个元素；或直接放入JQ对象或Raphael对象/集合
oAttrs_sAction，可以是css键值对对象，也可以是slideUp/slideDown/fadeIn/fadeOut等JQ效果名称
	如果是JQ动画的话，这个键值对对象，可以是attr:[value,easing]的形式
	如果是Raphael动画的话，如果想用每个属性不同缓冲的话，请分成多个动画实例，然后连接在动画链的同一位置
oOptions，是额外用于设置动画效果的参数集合对象
特殊说明：
----通用配置参数键名
	duration，动画耗时
	easing，缓冲函数
	done，总动画回调函数，默认为空函数，第一参为actor对应的对象，第二参为总动画执行完成的次数
	step，步进回调函数，默认为空函数，它是要放进JQ动画的options中或Raphael的onAnimation中
	delta，单元动画时间差，默认为0，可以为函数或任意整数，或关键字random
		为函数时，参数为每一单元的索引号
		为正整数时，单元集合按正序逐一延迟
		为负整数时，单元集合按倒序逐一延迟
	delay，总动画延迟，默认为0，可以为函数或正整数
		为函数时，参数为集合元素总数量
		为正整数时，即动画总的延迟毫秒数
	each(unit,index)，单元动画回调函数，默认为空函数，
		参数一为单位对象，参数二为此对象的索引号
	*****done函数语境为actor对应的对象，step/each函数语境为（如果是集合的话）集合中单独一个对象
----如果使用JQ对象，则options的特殊性为
	duration，默认为normal
	easing，默认为swing
	可以有键，specialEasing，规定每个属性的不同缓冲
----如果使用Raphael对象或集合，则options的特殊性为
	duration，不可为空
	easing，默认为linear（源码中的pipe）
----如果sJQorObj符合若干个元素的话，oOptions等各个位置的options对象，可以增加delta属性delay属性each属性
	此delta属性用于本JQ集合中，各个元素之间的动画时间延迟，所有元素都完成动画之后，内部解锁，然后才会执行next堆入的动画对象
	此delay属性用于本JQ集合动画之前的整体延迟，前置锁完成之后，延迟本段时间后再执行本对象中的行为
	此each属性用于本JQ集合中，各个元素动画完成之后，执行的一次回调函数，区别于done属性（所有元素完成之后才执行）
oAttrs及oOptions中的每个属性都可以是一个函数，函数参数首参为集合中每个元素的索引index，次参为对应的元素DOM对象（与$.map方法参数相同）
	但只有oOptions中的delay，是单参函数，参数是集合的容量即$.size()
前置及内置锁解锁时，进入执行部分，并立即重新上锁（以便后边可以正常调用）
*/
