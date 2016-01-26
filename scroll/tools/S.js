//字符串处理函数
define(function(require,exports,module){
	return {
		//首字母大写
		ucfirst:function(str){
			return str.charAt(0).toUpperCase()+ str.substring(1);
		},
		//将CSS属性转换成驼峰写法
		cammel:function(str){
			var words=str.split('-');
			for(var n=1;n<words.length;n++)
			{
				words[n]=this.ucfirst(words[n]);
			}
			return words.join("");
		},
		/*
		过滤颜色或转换矩阵中逗号或括号旁边的空格（过滤左括号两边的空格，但不过滤右括号右边的空格）
		过滤字符串首或尾部的空格
		将多个连续的空格换成一个空格
		*/
		clear:function(str){
			if(!str || typeof str=='object') return str;
			return $.trim(str.toString())
				.replace(/ *\( */g,'(')
				.replace(/ *\, */g,',')
				.replace(/ *\)/g,')')
				.replace(/ +/g,' ');
		},
		//分隔符，竖线、逗号、分号、除法斜线
		seperators:/[\|\,\;\/]/g,
		/*
		字符串列表转正则表达式，是用或连接的
		str，必须含有seperators所指定的分隔符
		settings，配置参数对象，可以使用的属性有
			begging，是否添加^，默认为false
			endding，是否添加$，默认为false
			global，是否使用g模式，默认为true
			ignore，是否使用i模式，默认为true
		*/
		toRegExp:function(str,settings){
			if(!str) return str;
			if(!settings)settings={};
			if(str.split) str=str.split(this.seperators);
			str=str.join('|');
			str=['(',str,')'];
			if(settings.begging) str.unshift('^');
			if(settings.endding) str.push('$');
			var mode=[];
			if(settings.global!==false) mode.push('g');
			if(settings.ignore!==false) mode.push('i');
			return new RegExp(str.join(''),mode.join(''));
		}
	};
});