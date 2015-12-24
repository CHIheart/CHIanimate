/*
返回准确定位：计算出某一元素的四个定位值（当它们是auto的时候）
如果元素是absolute定位，则返回相对于其定位父元素的定位值
如果元素是fixed定位，则返回相对于window的定位值
如果元素是relative定位，则返回相对于其父元素的定位值
direction可以是all（默认）/left/right/top/bottom
默认返回四个位置组成的对象，否则返回对应数值
*/
define(function(require,exports,module){
	$.fn.exactPosition=function(direction){
		function isAuto(str){return /auto/i.test(str);}
		!direction && (direction='all');
		var bHorizontal=/^all|left|right$/i.test(direction),
			bVertical=/^all|top|bottom$/i.test(direction);
		if(!bHorizontal && !bVertical) return false;
		var css={
				left:this.css("left"),
				right:this.css("right"),
				top:this.css("top"),
				bottom:this.css("bottom"),
			},
			bool={
				left:isAuto(css.left),
				right:isAuto(css.right),
				top:isAuto(css.top),
				bottom:isAuto(css.bottom),
			},
			position=this.css('position'),
			isFixed=/fixed/i.test(position),
			isAbs=/absolute/i.test(position),
			isRel=/relative/i.test(position),
			par=isFixed ? $(window) : isAbs ? this.offsetParent() : this.parent(),
			THIS=this;
		if(/static/i.test(position)) return false;
		function calc(horizontal)
		{
			var first= horizontal ? "left":"top",
				second=horizontal ? "right":"bottom",
				size=  horizontal ? "width":"height",
				Size= horizontal ? "Width":"Height",
				//绝对定位相对于定位父元素的填充盒，相对及固定定位相对于内容区
				parSize= par[isAbs ? "inner"+Size : size](),
				mySize= THIS["outer"+Size](true);
			if(bool[first] && bool[second])//两个都为auto，先算左，然后就可以用左（上）算右（下）
			{
				css[first]=isFixed ? 0 : parseFloat(par.css("padding-"+first));
				THIS.parentsUntil(par).each(function(index, el) {
					css[first]+= parseFloat($(this).css("margin-"+first))
								+parseFloat($(this).css("padding-"+first))
								+parseFloat($(this).css("border-"+first+"-width"));
	 			});
				bool[first]=false;
			}
			if(bool[second] && !bool[first])//用左（上）算右（下）
			{
				css[second]=parSize - mySize - parseFloat(css[first]);
			}
			else//用右（下）算左（上）
			{
				css[first]=parSize - mySize - parseFloat(css[second]);
			}
		}
		bHorizontal && calc(true);
		bVertical && calc(false);
		par=THIS=bool=null;
		return bHorizontal && bVertical ? css : css[direction.toLowerCase()];
	}
});
