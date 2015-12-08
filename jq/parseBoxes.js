/*
返回元素盒式布局上一点相对于文档的坐标
*****若要返回fixed定位相对于window的坐标，请自行在上下左右属性上减去$(window).scrollLeft|Top();
allBoxes返回所有盒对象数据
还可以分别使用，borderBox（边框盒）paddingBox（填充盒）contentBox（内容盒）marginBox（外边距盒）
盒数据为：{
	width:
	height:
	left:
	top:
	right:
	bottom:
}
*/
(function(){
	/*
	point，默认为空，返回对应的盒对象，可以使用
		left top，返回左上角坐标{x,y}
		right bottom，返回右下角坐标，以此类推
		左右不可同时使用，上下不可同时使用，必须使用两个词，不分顺序
	*/
	$.fn.borderBox=function(point){
		return getPoint(
			complete({
				width 	:round(this.outerWidth()),
				height 	:round(this.outerHeight()),
				left	:this.offset().left,
				top		:this.offset().top
			})
			,point
		);
	}
	$.fn.paddingBox=function(point){
		return getPoint(
			complete({
				width 	:round(this.innerWidth()),
				height 	:round(this.innerHeight()),
				left	:this.offset().left + parseInt(this.css('border-left-width')),
				top		:this.offset().top + parseInt(this.css('border-top-width'))
			})
			,point
		);
	}
	$.fn.contentBox=function(point){
		return getPoint(
			complete({
				width 	:round(this.width()),
				height 	:round(this.height()),
				left	:this.offset().left + parseInt(this.css('border-left-width')) + parseInt(this.css('padding-left')),
				top		:this.offset().top + parseInt(this.css('border-top-width')) + parseInt(this.css('padding-top')),
			})
			,point
		);
	}
	$.fn.marginBox=function(point){
		return getPoint(
			complete({
				width 	:round(this.outerWidth(true)),
				height 	:round(this.outerHeight(true)),
				left	:this.offset().left - parseInt(this.css('margin-left')),
				top		:this.offset().top - parseInt(this.css('margin-top'))
			})
			,point
		);
	}
	//补足盒对象的right与bottom
	function complete(box){
		box.right = box.left + box.width;
		box.bottom = box.top + box.height;
	}
	//在盒对象上获取一点，如无点，直接返回盒对象本身
	function getPoint(box,point){
		if(!point) return box;
		if(!/left|right/i.test(point) || !/top|bottom/i.test(point)) return false;
		var obj={
			x:0,y:0
		};
		if(/left/i.test(point)) obj.x=box.left;
		else if(/right/i.test(point)) obj.x=box.right;
		if(/top/i.test(point)) obj.y=box.top;
		else if(/bottom/i.test(point)) obj.y=box.bottom;
		return obj;
	}

	$.fn.allBoxes=function(){
		return {
			'padding-box': this.paddingBox(),
			'content-box': this.contentBox(),
			'margin-box' : this.marginBox(),
			'border-box' : this.borderBox()
		}
	}
})();
