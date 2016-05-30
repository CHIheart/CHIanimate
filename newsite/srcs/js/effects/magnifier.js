/**
 * 新的放大镜效果
 * @authors Your Name (you@example.org)
 * @date    2016-05-28 15:30:03
 * @version $Id$
 */

define(function(require,exports,module){
	/*
	sJQselector，图片的JQ选择器，一定要是一个img元素
	setOptions，配置集合对象，可以使用的键有
		width，放大框的宽，默认为100
		height，放大框的高，默认为100
		position，放大框相对于源元素的位置，默认为‘right’，还可以为left/top/bottom
		data，被放大元素放置原始图片路径的data属性，默认为primary，即data-primary
	*/
	return function CHImagnifier(sJQselector,setOptions){
		if(!$(sJQselector).length) return false;
		if(!$.isPlainObject(setOptions)) setOptions={};
		var defaultOptions={
			width: 100,
			height: 100,
			position: 'right',
			data: 'primary'
		};
		$.extend(true, defaultOptions, setOptions);

		var
		//被放大源
		tar=$(sJQselector).mouseenter(function(event) {
			$(document).mousemove(mouseMove);
			BLOCK.css({
				visibility: 'visible'
			})
			MAGNIFIER.show();
		}),
		par=tar.parent().css({
			position:'relative'
		}),
		//放大镜的框
		MAGNIFIER=$("<div/>").css({
			width: defaultOptions.width,
			height: defaultOptions.height,
			position: 'absolute',
			border: '1px solid silver',
			left: (function(){
				switch(defaultOptions.position.toLowerCase()){
					case 'top': case 'bottom': return -1;
					case 'left': return -defaultOptions.width - 2;
					case 'right': return tar.outerWidth() + 2;
					default: return 0;
				}
			})(),
			top: (function(){
				switch(defaultOptions.position.toLowerCase()){
					case 'left': case 'right': return -1;
					case 'top': return -defaultOptions.height - 2;
					case 'bottom': return tar.outerHeight() + 2;
					default: return 0;
				}
			})(),
			visibility:'hidden',
			overflow:'hidden'
		}),
		//图上移动的小块
		BLOCK=$("<div/>").css({
			position: 'absolute',
			backgroundColor: 'rgba(255,255,255,.5)'
		}).hide(),
		srcPrimary=tar.data(defaultOptions.data),
		oJQprimary=$("<img/>").attr("src",srcPrimary).each(function(index, el) {
			if(this.complete) calculate(this.width,this.height);
			$(this).load(function() {
				calculate(this.width,this.height);
			});
		});

		oJQprimary.appendTo(MAGNIFIER);
		MAGNIFIER.insertAfter(tar);
		BLOCK.insertAfter(tar);
		//根据原始图片的尺寸，计算小放大框的比例
		function calculate(iPrimaryWidth,iPrimaryHeight){
			BLOCK.css({
				width: tar.outerWidth() * defaultOptions.width / iPrimaryWidth,
				height: tar.outerHeight () * defaultOptions.height / iPrimaryHeight
			});
			MAGNIFIER.hide().css({
				visibility: 'visible'
			});
		}

		function clamp(minValue,value,maxValue){
			value=Math.max(minValue,value);
			value=Math.min(maxValue,value);
			return value;
		}

		//鼠标在图片范围内移动时保持放大效果
		function mouseMove(event){
			//鼠标移动的范围边界
			var x=event.clientX,
				y=event.clientY,
				width=tar.outerWidth(),
				height=tar.outerHeight(),
				left=tar.offset().left,
				top=tar.offset().top,
				right=left + width,
				bottom=top + height;
			if(x<left || x>right || y<top || y>bottom){
				$(document).off("mousemove",mouseMove);
				BLOCK.hide();
				MAGNIFIER.hide();
				return;
			};
			//小放大框的范围边界
			var iWidth=BLOCK.width(),
				iHeight=BLOCK.height(),
				iLeft=x - left - iWidth/2,
				iTop=y - top - iHeight/2;
			BLOCK.show().css({
				left:clamp(0,iLeft,width-iWidth),
				top:clamp(0,iTop,height-iHeight)
			});
			
			//放大镜里边的原图移动
			MAGNIFIER.show().find("img").each(function(index, el) {
				$(this).css({
					marginLeft: -$(this).width() * parseFloat(BLOCK.css("left")) / width,
					marginTop: -$(this).height() * parseFloat(BLOCK.css("top")) / height
				});
			});
		}
	}
});