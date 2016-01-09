//background-size，CSS3的属性，IE9+支持
/*
background-size
1.未设置时：
	1.1.在WEBKIT及IE下，返回auto
	1.2.在FF下，返回auto auto
2.计算过程使用使用双值
	2.1.单独的auto被转化成  auto auto
	2.2.关键字contain及cover
		2.2.1.容器过宽的cover，容器过窄的contain，被转化成  100% auto
		2.2.2.容器过窄的cover，容器过宽的contain，被转化成  auto 100%
	2.3.单独的数值被转化成  数值 auto
*/

define(function(require,exports,module){
	if(window.low) return true;
	var N=require("tools/N"),
		U=require("tools/U"),
		units=/px|em|rem|%/i,
		dimension=require("tools/bgDimension");
	$.scrollbar.extend('backgroundSize',{
		parse:function(database){
			var attr=this.name,
				value=database[attr]
		},
		unify:function(selector,original,terminal){}
	});
	return ;
});