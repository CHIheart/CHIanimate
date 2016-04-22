/*
oOptions，附加参数列表对象，可以使用的属性有
	.mode，默认为0，放大框跟随鼠标移动；否则在图片父级的某个方向，1上，2右，3下，4左
	.z，默认为10000，放大框的z轴
	.white，当在边缘时，是否让大图显示白底
		默认为false，鼠标在小图上移动到某些范围时，大图将会不动，图片停在边缘，以防背景被透出来
		如果是true，鼠标动，大图就跟着动，当移动到边角附近时，放大框相反的区域或显示放大框的背景
生成实例后，可以使用的函数有
	.show(imgObj,z,mode)，直接放大某个图片对象，可以更改放大镜的z轴及模式mode
*/
function CHImagnifier(oOptions) {
	if (!oOptions) oOptions = {};

	function isPos(n) {
		return n && /^[\+]?[0]*[1-9][\d]*$/.test(n);
	}
	var niModeInit = isPos(oOptions.mode) && oOptions.mode < 5 ? oOptions.mode : 0;
	var piZ = isPos(oOptions.z) ? oOptions.z : 10000;
	var bWhite = oOptions.white ? Boolean(oOptions.white) : false;
	var oResult = {};
	var oJQmag = $("<div/>").css({
		zIndex: piZ,
		position: "absolute"
	});
	oJQmag.attr('id', "Magnifier");
	oResult.init = function(oJQimg, z, niMode) {
		if (!oJQimg || !$(oJQimg).size()) return;
		if (!z) z = 10000;
		$(oJQimg).mouseenter(function() {
			oResult.show(this, z, niMode)
		});
		$(oJQimg).mousemove(function(event) {
			magnify(event, this, niMode)
		});
		$(oJQimg).mouseleave(function() {
			oResult.hide();
		});
	}
	oResult.show = function(oDomImg, z, niMode) {
		if (!oDomImg) return;
		if (!z) z = 10000;
		oJQmag.css("zIndex", z);
		var bHasImage = (oJQmag.has('img').length > 0),
			bEqualUrl = bHasImage && (oJQmag.find('img').get(0).src == oDomImg.src);
		if (!bHasImage || !bEqualUrl) {
			if (!bEqualUrl) oJQmag.empty();
			var oJQimg = $("<img/>");
			oJQimg.get(0).src = oDomImg.src;
			oJQmag.append(oJQimg);
		}
		$("body").append(oJQmag);
	}
	oResult.hide = function() {
		oJQmag.remove();
	}

	$("body").append(oJQmag); //如果不这么写WEBKIT读不到mag的尺寸
	oJQmag.css({
		top: 0,
		left: 0,
		"visibility": "hidden"
	});
	var iMagWidth = oJQmag.width(),
		iMagHeight = oJQmag.height(); //放大框内尺寸
	var iMagOutWidth = oJQmag.outerWidth(),
		iMagOutHeight = oJQmag.outerHeight(); //放大框外尺寸
	oJQmag.css({
		"visibility": "visible"
	}).remove();

	function magnify(event, oDomImg, niMode) {
		if (!isPos(niMode) && niMode !== 0 && niMode !== '0' || niMode > 5) niMode = niModeInit;
		var iMouseX = event.pageX,
			iMouseY = event.pageY,
			//鼠标位置
			p = $(oDomImg).offset(),
			iImgX = p.left,
			iImgY = p.top,
			//图片绝对位置
			iXonImg = iMouseX - iImgX,
			iYonImg = iMouseY - iImgY,
			//鼠标相对于图片的位置
			iThumbWidth = $(oDomImg).width(),
			iThumbHeight = $(oDomImg).height(),
			//缩略图尺寸
			oJQimg = oJQmag.find('img').eq(0),
			iImgWidth = oJQimg.width(),
			iImgHeight = oJQimg.height(); //图片实际尺寸
		var iGoalX, iGoalY; //放大框目标位置
		if (!niMode) {
			iGoalX = iMouseX + 10;
			iGoalY = iMouseY + 10;
			var W = $(window),
				iMaxMagX = W.width() * 0.5 + W.scrollLeft(),
				iMaxMagY = W.height() * 0.5 + W.scrollTop();
			if (iGoalX > iMaxMagX) iGoalX -= 20 + iMagOutWidth;
			if (iGoalY > iMaxMagY) iGoalY -= 20 + iMagOutHeight;
		} else {
			var par = $(oDomImg).parent(),
				pp = par.offset(),
				iParentLeft = pp.left,
				iParentTop = pp.top,
				//父级绝对位置
				iParentWidth = par.outerWidth(),
				iParentHeight = par.outerHeight();
			//父级外尺寸
			iGoalX = iParentLeft;
			iGoalY = iParentTop;
			switch (niMode) {
			case 1:
				iGoalY -= iMagOutHeight;
				break;
			case 2:
				iGoalX += iParentWidth;
				break;
			case 3:
				iGoalY += iParentHeight;
				break;
			case 4:
				iGoalX -= iMagOutWidth;
				break;
			}
		}
		oJQmag.css({
			left: iGoalX,
			top: iGoalY
		});
		//计算在无限制情况下的大图的左、上外边距
		var iPhotoTop = -iImgHeight * iYonImg / iThumbHeight + iMagHeight * 0.5;
		var iPhotoLeft = -iImgWidth * iXonImg / iThumbWidth + iMagWidth * 0.5;
		if (!bWhite) { //不露白边，则最大为0，最小为图右下角在放大镜右下角
			iPhotoTop = iPhotoTop > 0 ? 0 : Math.max(iMagHeight - iImgHeight, iPhotoTop);
			iPhotoLeft = iPhotoLeft > 0 ? 0 : Math.max(iMagWidth - iImgWidth, iPhotoLeft);
		}
		oJQimg.css({
			marginTop: iPhotoTop,
			marginLeft: iPhotoLeft
		});
	}
	return oResult;
}