// JavaScript Document

function CHIoptionWin()
{
	var o=new Object();
	o.id="CHIoption";
	var t/*target*/;
	o.focus=function(id){
		if(!t) t=$('#'+o.id);
		if(!id)return;
		var init=function(){t.slideDown();}
		$.ajax({
			url:"option.php?id=" + id
			,success:function(data){
				t.html(data);
				if(t.find("ul").size()>1)
				{
					t.find("h3").click(function(){
					//只有一个被展开；点击被展开的，无效果
						if($(this).next("ul").attr("state")=="false")
						{
							t.find("ul").not(this).slideUp().attr({"state":false});
							$(this).next("ul").slideDown().attr({"state":true});
						}
					}).next("ul").attr({"state":false});
				}
				resize();
				CHIbg.show(init);
			}
			,fail:function(){alert('fail');}
		});
	}
	o.close=function(cbfun){
		t.slideUp("normal",function(){
			t.html('');
			CHIbg.hide();
			if(cbfun)cbfun();
		});
	}
	function resize(){
		var tw=t.outerWidth(true);
		var ww=Math.max(tw,$(window).width());
		t.css({
			"left":Math.max(0,(ww-t.outerWidth(true))*0.5)
		});
	}
	$(window).resize(resize);
	return o;
}
var CHIoption=new CHIoptionWin();
(function(){
	document.write('<div id="CHIoption">');
	//document.write('<li><a onclick="CHIoption.close();"><i class="fa fa-times"></i>'+_words('close')+'</a></li>');
	document.write('</div>');
})();