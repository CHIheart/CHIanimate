/*
显示一个半透明的背景色遮挡层
全局对象CHIbg
.open(cbfun)，打开动作，可以加一个回调
.close(cbfun)，关闭动作，同上（会先放弃监听）
.focus(obj)，放弃上一次监听，并监听新对象，当点击遮挡层时，被监听的对象关闭（一般此对象的关闭也包含了遮挡层的关闭）
.blur()，放弃监听，一般在更换插件时使用
*/
var CHIbg;
(function(){
	return;
	var win=$(window);
	CHIbg=$("<div>").addClass("CHIbg");
	CHIbg.appendTo("body");
	CHIbg.open=function(cbfun){
		this.fadeIn(function(){
			if(cbfun)cbfun();
		});
		return this;
	}
	CHIbg.close=function(cbfun){
		this.blur().fadeOut(function(){
			if(cbfun)cbfun();
		}).unbind();
		return this;
	}
	CHIbg.focus=function(obj){
		this.blur().one('click',function(){
			if(obj.close) obj.close();
		});
		return this;
	}
	CHIbg.blur=function(){
		this.unbind('click');
		return this;
	}
})();

