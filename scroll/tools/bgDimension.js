//根据background-origin来返回尺寸（IE8-，没有background-origin，但默认的渲染效果等同于padding-box）
define(function(require,exports,module){
	return function dimension(selector)
	{
		return (function(){
			var o=$(selector);
			switch(o.css("background-origin"))
			{
				case 'content-box': return [o.width(),o.height()];
				case 'border-box': return [o.outerWidth(),o.outerHeight()];
				//case 'padding-box':
				default:
					return [o.innerWidth(),o.innerHeight()];
			}
		})();
	}
;
});