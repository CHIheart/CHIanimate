/*
抽屉式标题内容伸缩效果
sJQcontainer，必需，要执行本效果的容器的JQ选择器字符串
sJQtitles，必需，在$(sJQcontainer)基础上，查找各标题栏的JQ选择器字符串，点击它们会使对应的内容栏收缩或展开
sJQcontents，必需，在$(sJQcontainer)基础上，查找各内容栏的JQ选择器字符串，它们是会收缩或展开的部分，一定要有overflow:hidden
oOptions，附加参数列表对象，可以使用的属性有
	.dir，方向，默认为h，只可以为v/h
	.type，动作类型，默认为1，具体说明在函数体内
oCallbacks，回调函数列表对象，可以使用的属性有
	.init(oJQdt0,oJQdd0)，完成初始化时执行的函数，不可以直接使用生成的对象名，参数为第一对标题及内容的JQ对象
	.hide(oJQdtHide,oJQddHide)，每一次缩回时执行的函数，oJQdtHide是被隐藏的标题栏JQ对象，oJQddHide是被隐藏的内容栏JQ对象
	.show(oJQdtShow,oJQddShow)，每一次展开时执行的函数，oJQdtShow是被显示的标题栏JQ对象，oJQddShow是被显示的内容栏JQ对象
如果生成有名对象的话，可以调用的方法有
	var.show(index)，展开索引为index(index>=0)的内容栏，根据type而有所不同
	var.hide(iIndex)，当无iIndex时，缩回所有内容栏
				当iIndex为正整数时，缩回索引为i的内容栏
				当iIndex为负整数时，缩回除了索引为-iIndex的其它内容栏
				0和-0是不一样的
*/
function CHIdrawer(sJQcontainer, sJQtitles, sJQcontents, oOptions, oCallbacks) {
	if (!sJQcontainer || !$(sJQcontainer).size()) return;
	if (!oOptions) oOptions = {};
	if (!oCallbacks) oCallbacks = {};

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}

	function isNeg(n) {
		return n && /^[\-][0]*[1-9][\d]*$/.test(n);
	}

	function int(n) {
		return parseInt(n) || 0;
	}
	var cDirection = oOptions.dir && oOptions.dir.toLowerCase() == "v" ? "v" : "h";
	var iType = isPos(oOptions.type) && oOptions.type < 4 ? oOptions.type : 1;
	var oJQcontainer = $(sJQcontainer).eq(0),
		oJQtitles = oJQcontainer.children(sJQtitles),
		oJQcontents = oJQcontainer.children(sJQcontents),
		oResult = {},
		oState = {
			state: 0
		};
	if (cDirection == "v") {
		oResult.show = function(index, fCallback) {
			if (index >= 0) {
				oJQcontents.eq(index).slideDown("", "", function() {
					if (fCallback) fCallback();
					if (oCallbacks.show) oCallbacks.show(oJQtitles.eq(index), oJQcontents.eq(index));
				}).data({
					state: 1
				});
				oJQtitles.eq(index).addClass("cur");
			}
		};
		oResult.hide = function(iIndex, fCallback) {
			var fFunction = function() {
					if (fCallback) fCallback();
					if (oCallbacks.hide) oCallbacks.hide(oJQtitles.eq(iIndex), oJQcontents.eq(iIndex));
				};
			if (iIndex === undefined || iIndex === null || iIndex === "") {
				oJQcontents.slideUp("", "", fFunction).data(oState);
				oJQtitles.removeClass("cur");
			} else if (isPos(iIndex) || iIndex === "0" || iIndex === 0) {
				oJQcontents.eq(iIndex).slideUp("", "", fFunction).data(oState);
				oJQtitles.eq(iIndex).removeClass("cur");
			} else if (isNeg(iIndex) || iIndex === "-0" || iIndex === -0) {
				oJQcontents.not(":eq(" + -iIndex + ")").slideUp("", "", fFunction).data(oState);
				oJQtitles.not(":eq(" + -iIndex + ")").removeClass("cur");
			}
		};
	} else {
		var iWidth = oJQcontents.width(),
			iPaddingLeft = int(oJQcontents.css("paddingLeft")),
			iPaddingRight = int(oJQcontents.css("paddingRight"));
		oResult.show = function(index, fCallback) {
			if (index >= 0) {
				oJQcontents.eq(index).animate({
					width: iWidth,
					paddingLeft: iPaddingLeft,
					paddingRight: iPaddingRight
				}, "", "", function() {
					if (fCallback) fCallback();
					if (oCallbacks.show) oCallbacks.show(oJQtitles.eq(index), oJQcontents.eq(index));
				}).data({
					state: 1
				});
				oJQtitles.eq(index).addClass("cur");
			}
		};
		//无参缩回所有，正参缩回对应，负参缩回其它
		var hideCss = {
			width: 0,
			paddingLeft: 0,
			paddingRight: 0
		};
		oResult.hide = function(iIndex, fCallback) {
			var fFunction = function() {
					if (fCallback) fCallback();
					if (oCallbacks.hide) oCallbacks.hide(oJQtitles.eq(i), oJQcontents.eq(i));
				};
			if (iIndex === undefined || iIndex === null || iIndex === "") {
				oJQcontents.animate(hideCss, "", "", fFunction).data(oState);
				oJQtitles.removeClass("cur");
			} else if (isPos(iIndex) || iIndex === "0" || iIndex === 0) {
				oJQcontents.eq(iIndex).animate(hideCss, "", "", fFunction).data(oState);
				oJQtitles.eq(iIndex).removeClass("cur");
			} else if (isNeg(iIndex) || iIndex === "-0" || iIndex === -0) {
				oJQcontents.not(":eq(" + -iIndex + ")").animate(hideCss, "", "", fFunction).data(oState);
				oJQtitles.not(":eq(" + -iIndex + ")").removeClass("cur");
			}
		};
	}

	function get(DOM) {
		return oJQtitles.index(DOM);
	}
	switch (iType) {
		//模式一，点哪个展开哪个，如果是已经展开的则缩回，不影响其它（可以展开任意多个，也可以关闭任意多个）
	case 1:
		oJQtitles.click(function() {
			var i = get(this);
			if (oJQcontents.eq(i).data("state") == 1) oResult.hide(i);
			else oResult.show(i);
		});
		oResult.hide();
		break;

		//模式二，点哪个展开哪个，其它缩回，如果是已经展开的则不动，缩回与展开同时进行（只展开一个，不可全部关闭）
	case 2:
		oJQtitles.click(function() {
			var i = get(this);
			if (oJQcontents.eq(i).data("state") == 1) return;
			else {
				oResult.hide("-" + i);
				oResult.show(i);
			}
		});
		oResult.hide("-0");
		oResult.show(0);
		break;

		//模式三，点哪个展开哪个，其它缩回，如果是已经展开的则缩回，缩回与展开同时进行（最多展开一个，可以全部关闭）
	case 3:
		oJQtitles.click(function() {
			var i = get(this);
			if (oJQcontents.eq(i).data("state") == 1) oResult.hide(i);
			else {
				oResult.hide("-" + i);
				oResult.show(i);
			}
		});
		oResult.hide();
		break;

	default:
		;
	}
	if (oCallbacks.init) oCallbacks.init(oJQtitles.eq(0), oJQcontents.eq(0));
	return oResult;
}