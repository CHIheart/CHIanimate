/*
返回准确定位：计算出某一元素的四个定位值（当它们是auto的时候）
如果元素是absolute定位，则返回相对于其定位父元素的定位值，其百分比量相对于父元素填充区
如果元素是fixed定位，则返回相对于window的定位值，其百分比量相对于window对象尺寸
如果元素是relative定位，则返回相对于其自身原位置的偏移值，其百分比量相对于父元素内容区
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
		var position=this.css('position');
		if(/static/i.test(position)) return false;
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
			THIS=this,
			par=(function(){
				switch(position)
				{
					case 'fixed': return $(window);
					case 'absolute': return THIS.offsetParent();
					case 'relative': return THIS.parent();
				}
			})();
		function calc(horizontal)
		{
			var first= horizontal ? "left":"top",
				second=horizontal ? "right":"bottom",
				size=  horizontal ? "width":"height",
				Size=  horizontal ? "Width":"Height";
			//相对定位的两对属性互为相反数
			if('relative'==position)
			{
				if(bool[first] && bool[second]) css[first]=css[second]=0;
				else if(bool[first]) css[first]=-parseInt(css[second])+'px';
				else css[second]=-parseInt(css[first])+'px';//无论第二属性为何值，都是第一属性的相反数
			}
			else
			{
				var parSize= par["inner"+Size](),
					mySize= THIS["outer"+Size](true);
				//当全为auto时，需要计算
				if(bool[first] && bool[second])
				{
					//fixed元素会经过html及body元素，到达window，而window本身没有padding
					css[first]=position=='fixed' ? 0 : parseFloat(par.css("padding-"+first));
					THIS.parentsUntil(par).each(function(index, el) {
						css[first]+= parseFloat($(this).css("margin-"+first))
									+parseFloat($(this).css("padding-"+first))
									+parseFloat($(this).css("border-"+first+"-width"));
		 			});
					bool[first]=false;
				}
				//因为webkit浏览器出现不同程度的百分比数值BUG，所以都要重新计算准确的像素值
				else
				{
					css[first]=$(THIS).offset()[first]
						- par.offset()[first]
						- parseFloat(par.css("border-"+first))
						- parseFloat($(THIS).css("margin-"+first));
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
		}
		bHorizontal && calc(true);
		bVertical && calc(false);
		par=THIS=bool=null;
		return bHorizontal && bVertical ? css : css[direction.toLowerCase()];
	}
});
