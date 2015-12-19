//基本单位转化函数
define(function(require,exports,module){
	var N=require("./N");
	function fontSize(selector){
		return N.fix($(selector).css("fontSize"),2);
	}
	//单位转化函数，全部都使用.call调用在JQ或DOM对象上
	return {
		px2em:function(px){
			var f=N.fix,
				fs=fontSize(this),
				p=f(px,2);
			return f(p/fs,2);
		},
		em2px:function(em){
			var f=N.fix,
				fs=fontSize(this),
				e=f(em,2);
			return f(e*fs,2);
		},
		px2rem:function(px){
			var f=N.fix,
				fs=fontSize("body"),
				p=f(px,2);
			return f(p/fs,2);
		},
		rem2px:function(rem){
			var f=N.fix,
				fs=fontSize("body"),
				r=f(rem,2);
			return f(r*fs,2);
		},
		em2rem:function(em){
			return this.px2rem(this.em2px(em));
		},
		rem2em:function(rem){
			return this.px2em(this.rem2px(rem));
		}
	};
});