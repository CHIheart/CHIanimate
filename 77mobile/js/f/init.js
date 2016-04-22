// JavaScript Document
//信息列表的初始化行为
function CHI_list_init(){CHI_all_dd_options("CHIlist");}
//清单列表的初始化行为
function CHI_bill_init(){CHI_all_dd_options("CHIbill");}
//分组列表的初始化行为
function CHI_group_init(){CHI_all_dd_options("CHIgroup");}
//交互列表的初始化行为
function CHI_chat_init(){CHI_all_dd_options("CHIchat");}
function CHI_all_dd_options(JQclass)
{
	$("."+JQclass+" > li > dl > dt q:first-of-type").click(function(){
		var t=$(this).parentsUntil("dl").last().next("dd");
		$(this).parentsUntil("body").last().find("dd.Has").not(t.get(0)).slideUp();
		t.slideToggle();
	});
}
//页脚部分，各个链接打开或关闭menu时，链接激活行为
function CHIcur(tar,id)
{
	$("footer a").not(tar).removeClass("cur");
	$(tar).toggleClass("cur");
	$("menu").not("#"+id).slideUp();
	$("#"+id).slideToggle();
}
//搜索用的表单，顶部标题点击展开/缩回行为
function CHI_form_fold(JQform)
{
	if(!JQform)JQform="form:first-of-type";
	$(JQform).find(":header:first-of-type").click(function(){
		$(this).toggleClass("fold");
	});
}
//显示/隐藏页眉及页脚的行为
function CHI_HNF(obj,b)
{
	if(!b)
	{
		$(obj).parent().hide();
		$("footer a").removeClass("cur");
		$("header,footer").slideUp();
		$("body").animate({
			"paddingTop":10
			,"paddingBottom":10
		});
		$("#HNFdown").fadeIn();
	}
	else
	{
		$(obj).fadeOut();
		$("body").animate({
			"paddingTop":50
			,"paddingBottom":50
		});
		$("header,footer").slideDown();
	}
}
//ajax最常调用的失败及完成的行为
function ajaxError(){CHIalarm.error('AJAX ERROR!');}
function ajaxClose(){CHIalarm.close();}