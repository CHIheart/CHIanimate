//数字处理函数
define(function(require,exports,module){
	var N={
		units:'%|in|cm|mm|em|ex|pt|pc|px|rem|deg'.split('|'),
		//返回数值，如果是非可运算量，则返回其本身
		value:function(str){
			var type=this.type(str);
			if(type===false) return str;
			return str.match(this.reg[type])[1];
		},
		//百分量转浮点数
		per2float:function(per){
			if(!isNaN(per)) return per*1;
			if(this.type(per)=='%') return per.replace('%','')*.01;
			return false;
		},
		//浮点数转百分量
		float2per:function(num){
			if(!isNaN(num)) return false;
			return (num * 100).toFixed(2) + '%';
		},
		//给值保留指定的小数位
		fix:function(n,bit){
			return parseFloat(n).toFixed(bit);
		},
		type:function(str){
			for(var n in this.reg)
			{
				if(this.reg[n].test(str)) return n;
			}
			//纯数字的话，按px处理（zIndex属性会在自己的函数中处理这个问题）
			return isNaN(str) ? false : 'px';
		}
	};
	//添加带有各种单位的正则表达式
	(function(){
		N.reg={};
		var num='[\\+\\-]?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
		for(var n in N.units)
		{
			var u=N.units[n];
			N.reg[u]=new RegExp(['^(',num,')',u,'$'].join(''),"i");
		}
		N.reg['']=new RegExp(['^',num,'$'].join(''));
	})();
	return N;
});