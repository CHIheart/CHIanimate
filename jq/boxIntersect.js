/*
!!!!!!!!!本插件依赖parseBoxes插件

判断两个盒的交叠情况，只要有一像素重叠就算
obj，可以是选择器，DOM，或JQ对象，必选
atmosphere，默认为false，只计算border-box部分，如果为true则计算margin-box部分，有磁性吸引的效果
返回对象{
	mode: 'contain（包含）|intersect（交叠）',
	left, right, top, bottom 交叠区的四个位置
}
不交叠的话返回false
*/
(function(){
	$.fn.boxIntersect=function(obj,atmosphere){
		atmosphere=!!atmosphere;
		var obj1=this,
			obj2=$(obj),
			size1=parseInt(obj1.outerWidth(atmosphere)) * parseInt(obj1.outerHeight(atmosphere)),
			size2=parseInt(obj2.outerWidth(atmosphere)) * parseInt(obj2.outerHeight(atmosphere)),
			small= size2>=size1 ? obj1 : obj2,
			big= size1>size2 ? obj1 : obj2,
			box= atmosphere ? "marginBox" : "borderBox",
			boxSmall= small[box](),
			boxBig= big[box](),
			leftBig= boxBig.left,
			rightBig= boxBig.right,
			leftSmall= boxSmall.left,
			rightSmall= boxSmall.right,
			leftIn= leftSmall >= leftBig && leftSmall <= rightBig,
			rightIn= rightSmall >= leftBig && rightSmall <= rightBig;
		if(!leftIn && !rightIn) return false;
		var topBig= boxBig.top,
			bottomBig= boxBig.bottom,
			topSmall= boxSmall.top,
			bottomSmall= boxSmall.bottom,
			topIn= topSmall >= topBig && topSmall <= bottomBig,
			bottomIn=  bottomSmall >= topBig && bottomSmall <= bottomBig;
		if(!topIn && !bottomIn) return false;
		return {
			mode: topIn && bottomIn && leftIn && rightIn ? "contain" : "intersect",
			left: leftIn ? leftSmall : leftBig,
			right: rightIn ? rightSmall : rightBig,
			top: topIn ? topSmall : topBig,
			bottom: bottomIn ? bottomSmall : topSmall
		};
	}
})();
