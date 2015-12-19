//关键字判别函数
define(function(require,exports,module){
	return {
		a:function(s){return /auto/i.test(s);},
		i:function(s){return /inherit/i.test(s);},
		n:function(s){return /none/i.test(s);}
	};
});