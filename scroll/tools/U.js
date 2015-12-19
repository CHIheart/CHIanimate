//预置的转化函数
define(function(require,exports,module){
	var N=require("./N"),
		TO=require("./TO");
	return function(selector,original,terminal){
		var attr=this.name;
		if(!(attr in original) || !(attr in terminal)) return false;
		var val1=original[attr],
			val2=terminal[attr],
			type1=N.type(val1),
			type2=N.type(val2);
		if(type1==type2) return true;
		var funName=type1+'2'+type2;
		if(funName in TO) original[attr]=TO[funName](val1);
		else console.error("预置的单位转化函数无法处理这两个值",val1,val2);
	};
});