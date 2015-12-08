/*
!!!!!!!!本插件依赖parseBoxes插件

判断点是否在元素的盒模型内
x/y，点坐标，必选
atmosphere，默认为false，只计算border-box及以内的部分，如果为true则也计算margin-box部分
如果点在盒内，返回是在哪一个盒内（较外层的），否则返回false
*/
(function(){
	$.fn.hasPoint=function(x,y,atmosphere){
		var boxes="contentBox,paddingBox,borderBox".split(',');
		atmosphere && boxes.push("marginBox");
		for(var n in boxes)
		{
			var box=this[boxes[n]]();
			if(x>=box.left && x<=box.right && y>=box.top && y<=box.bottom) return boxes[n];
		}
		return false;
	}
})();