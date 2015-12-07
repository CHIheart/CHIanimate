/*
返回准确定位：计算出某一absolute元素的四个定位值（当它们是auto的时候）
如果元素是fixed定位，则返回相对于window的定位值
direction可以是all（默认）/left/right/top/bottom
*/
(function(){
	$.fn.exactPosition=function(direction){
		function ucfirst(str){return str.charAt(0).toUpperCase()+ str.substring(1);}
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
			par=/fixed/i.test(position) ? $(window) : this.offsetParent(),
			THIS=this;
		function calc(horizontal)
		{
			var first= horizontal ? "left":"top",
				second=horizontal ? "right":"bottom",
				size=  horizontal ? "width":"height",
				Size= ucfirst(size),
				parSize= par["inner"+Size](),
				mySize= THIS["outer"+Size](true);
			if(bool[first] && bool[second])//两个都为auto，先算左，然后就可以用左（上）算右（下）
			{
				css[first]=parseFloat(par.css("padding-"+first));
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
})();
