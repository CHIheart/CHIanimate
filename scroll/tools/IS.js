//差别类函数
define(function(require,exports,module){
	return {
		f:function(f){return f instanceof Function;},
		a:function(a){return a instanceof Array;},
		o:function(o){return typeof o=='object';},
		s:function(o){return typeof o=='string';},
		noop:function(o){return o==$.noop;},
		hook:function(h){return this.o(h) && this.f(h.get) && this.f(h.set);}
	};
});