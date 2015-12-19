//JQ扩展根据position来判断元素的父级
define(function(require,exports,module){
	/*
	返回元素的参照父元素，根据元素的position属性值有所区别
	fixed，window对象
	absolute，$.offsetParent对象
	relative,static，直接父元素
	*/
	$.fn.referenceParent=function(){
		switch($(this).css('position'))
		{
			case 'fixed': return $(window);
			case 'absolute': return $(this).offsetParent();
			default: return $(this).parent();
		}
	}
	return;
});