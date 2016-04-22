/*
自定义提示框
一般使用如下快捷方法
error，显示一条错误信息
ok，显示一条成功信息
ask，显示选择信息
close，关闭提示框
*/

function CHIalarmWin()
{
	var o=new Object();
	o.id="CHIalarm";
	var t/*target*/,w=-1/*watch*/,confun/*confirm function*/,canfun/*cancel function*/;
	/*
		paraObj，窗口参数对象
		.type，默认为0提示窗，为1是选择窗
		.infor，提示类型，warn，tip，ok，fail，error
		.mes，字符串，附加的提示内容
		.confun，提示窗或选择窗的确认事件
		.canfun，选择窗的取消事件，仅当type=1时有效
		.auto，如果是ok模式的话，当auto===true时，可以自动执行confun
	*/
	o.focus=function(paraObj){
		if(!t) t=$('#'+o.id);
		set(paraObj);
		resize();
		$(window).resize(resize);
		var init=function(){t.fadeIn();}
		CHIbg.show(init);
		
	}
	o.error=function(mes,confun){
		o.say(mes,'error',confun);
	}
	o.ok=function(mes,confun){
		o.say(mes,'ok',confun,true);
	}
	o.say=function(mes,infor,confun,auto){
		if(!mes)return;
		if(!confun) confun=function(){};
		if(!infor) infor='warn';
		var obj={
			type:0
			,infor:infor
			,mes:mes
			,confun:confun
			,auto:auto
		};
		o.focus(obj);
	}
	o.ask=function(mes,confun,canfun){
		if(!mes)return;
		if(!confun) confun=function(){};
		if(!canfun) canfun=function(){};
		var obj={
			type:1
			,infor:'ask'
			,mes:mes
			,confun:confun
			,canfun:canfun
		};
		o.focus(obj);
	}
	o.close=function(delay,cbfun){
		if(!delay)delay=3000;
		clearTimeout(w);
		w=0;//关闭超时计时
		$(window).unbind("resize",resize);
		w=setTimeout(function(){
			t.fadeOut("normal",function(){
				w=-1;
				CHIbg.hide();
				if(cbfun)cbfun();
			});
		},delay);
	}
	function resize(){
		var tw=t.outerWidth(true),th=t.outerHeight(true);
		var ww=Math.max(tw,$(window).width()),wh=Math.max(th,$(window).height());
		t.css({
			"top":Math.max(0,(wh-th)*0.5)
			,"left":Math.max(0,(ww-tw)*0.5)
		});
	}
	function set(paraObj){
		var tp/*type*/=0,i/*infor*/='tip',m/*message*/=_words('doing');
		if(paraObj)
		{
			if("type" in paraObj)tp=paraObj.type;
			if("infor" in paraObj)i=paraObj.infor;
			if("mes" in paraObj)m=paraObj.mes;
			if("confun" in paraObj)confun=paraObj.confun;
			if(tp)if("canfun" in paraObj)canfun=paraObj.canfun;
			if("auto" in paraObj)auto=paraObj.auto;
		}
		//正常显示的时候，显示第一个dt，及对应type的第某个ul
		t.find("dt").hide().eq(0).show().find("i").removeClass().addClass(i).html(_words(i));
		t.find("dd").show().html(m);
		t.children(tp?"ol":"ul").hide();
		t.children(tp?"ul":"ol").show();
		if(tp)
		{
			t.find("ul li:first-child").unbind().click(doing);//点击确认
			t.find("ul li:last-child").unbind().click(function(){//点击取消
				o.close(100,canfun);
			});
		}
		else
		{
			if(i=="ok" && auto===true) setTimeout(confun,1000);
			t.find("ol li").unbind().click(function(){
				o.close(100,confun);
			});
		}
		clearTimeout(w);
		w=0;//关闭超时计时
	}
	function doing(){
		//显示处理中的时候，只显示处理中，隐藏附加提示及工具按钮
		w=-1;//开启超时计时开关（并未开始计时）
		t.find("dt").hide().eq(1).show();
		t.find("dd,ul,ol").hide();
		if(confun)confun();//这个函数中如果有执行alarm的其它函数（set系列或close），则会关闭超时计时
		if(w<0)w=setTimeout(function(){//开始超时计时
			o.error(_words('timeoutTip'));
		},10000);
	}
	return o;
}
var CHIalarm=new CHIalarmWin();
(function(){
	document.write('<div id="CHIalarm">');
	document.write('<dl>');
	document.write('<dt><i class=""></i></dt>');
	document.write('<dt><b class="fa fa-spinner fa-spin"></b>'+_words('doing')+'</dt>');
	document.write('<dd></dd>');
	document.write('</dl>');
	document.write('<ol>');//只有一个确定按钮
	document.write('<li><a><i class="fa fa-smile-o"></i>'+_words('confirm')+'</a></li>');
	document.write('</ol>');
	document.write('<ul>');//有确定与取消按钮
	document.write('<li><a><i class="fa fa-check"></i>'+_words('confirm')+'</a></li>');
	document.write('<li><a><i class="fa fa-times"></i>'+_words('cancel')+'</a></li>');
	document.write('</ul>');
	document.write('</div>');
})();