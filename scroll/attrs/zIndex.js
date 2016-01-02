//z轴
define(function(require,exports,module){
	$.scrollbar.extend('z-index',{
		units:'',
		parse:$.noop,
		unify:function(selector,original,terminal){
			var attr=this.name;
			original[attr]=parseInt(original[attr]) || 0;
			terminal[attr]=parseInt(terminal[attr]) || 0;
		}
	});
});