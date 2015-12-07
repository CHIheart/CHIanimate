/*
返回元素盒式布局上一点相对于文档的坐标
box，默认为空，返回整个盒的解析对象，可以使用content-box,padding-box,border-box,margin-box
point，默认为空，返回对应的盒对象，可以使用
	left top，返回左上角坐标{x,y}
	right bottom，返回右下角坐标，以此类推
	左右不可同时使用，上下不可同时使用，必须使用两个词，不分顺序
*/
(function(){
	$.fn.parseBoxes=function(box,point){
		var offset=this.offset(),
			round=Math.round,
			w=round(this.width()),
			h=round(this.height()),
			iw=round(this.innerWidth()),
			ih=round(this.innerHeight()),
			ow=round(this.outerWidth()),
			oh=round(this.outerHeight()),
			mw=round(this.outerWidth(true)),
			mh=round(this.outerHeight(true)),
			bt=parseInt(this.css('border-top-width')),
			bl=parseInt(this.css('border-left-width')),
			pt=parseInt(this.css('padding-top')),
			pl=parseInt(this.css('padding-left')),
			mt=parseInt(this.css('margin-top')),
			ml=parseInt(this.css('margin-left')),
			result={
				'border-box':{
					width 	:ow,
					height 	:oh,
					left	:offset.left,
					top		:offset.top
				}
			};
		result['padding-box']={
			width 	:iw,
			height 	:ih,
			left	:offset.left + bl,
			top		:offset.top + bt
		};
		result['content-box']={
			width 	:w,
			height 	:h,
			left	:offset.left + bl + pl,
			top		:offset.top + bt + pt,
		};
		result['margin-box']={
			width 	:mw,
			height 	:mh,
			left	:offset.left - ml,
			top		:offset.top - mt
		}
		for(var n in result)
		{
			result[n].right = result[n].left + result[n].width;
			result[n].bottom = result[n].top + result[n].height;
		}
		
		if(box in result){
			result=result[box];
			//必须使用两个词代表一个点
			if(/left|right/i.test(point) && /top|bottom/i.test(point))
			{
				var obj={
					x:0,y:0
				};
				if(/left/i.test(point)) obj.x=result.left;
				else if(/right/i.test(point)) obj.x=result.right;
				if(/top/i.test(point)) obj.y=result.top;
				else if(/bottom/i.test(point)) obj.y=result.bottom;
				result=obj;
			}
		}
		return result;
	}
})();
