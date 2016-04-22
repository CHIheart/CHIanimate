// JavaScript Document
/*
id，效果的最外层DOM的ID，也可以使用JQ串
imgJQstr，在此DOM上找到图片所使用的JQ选择器串
paraObj，设置的变量对象，可以使用的属性有
	minW，图片显示的最小宽度，默认为200
	minH，图片显示的最小高度，默认为200
	hGap，查看器最外围与窗口的横向间隙，默认为20
	vGap，同上，纵向间隙，默认为20
如果生成有名对象的话，可以调用的方法有
	var.shut()，关闭中心的预览图
	var.prev()，预览已读取列表中上一个图片
	var.next()，预览已读取列表中下一个图片
	var.play(DOMImgobj)，预览列表中指定的某一个图片
*/
function CHIviewer(id,imgJQstr,paraObj)
{
	if(typeof(CHIbg)=="undefined"){alert('CHIbg'+_words('not,dfn'));return;}
	if(!$("#"+id).size())return;
	function get(DOM){return ps.toArray().indexOf(DOM);}
	var o=new Object();
	/*pictures*/var ps=(!imgJQstr)?($("#"+id+" img")):($("#"+id).find(imgJQstr));
	ps.click(function(){o.play(this);});
	/*current*/var c=0;
	/*min width*/var mw=(paraObj && "minW" in paraObj)?paraObj.minW:200;
	/*min height*/var mh=(paraObj && "minH" in paraObj)?paraObj.minH:200;
	/*horizontal gap*/var hg=(paraObj && "hGap" in paraObj)?paraObj.hGap:20;
	/*vertical gap*/var vg=(paraObj && "vGap" in paraObj)?paraObj.vGap:20;
	var div=document.createElement("div");
	div.id=id+"Viewer";
	div.className="CHIviewer";
	/*quit*/var q=document.createElement("q");
	$(q).mouseover(function(){$(this).fadeTo('normal',1)})
		.mouseout(function(){$(this).fadeTo('normal',0.6)})
		.click(function(){o.shut()})
		.fadeTo('normal',0.6);
	/*magnify*/var mag=document.createElement("b");
	$(mag).mouseover(function(){$(this).fadeTo('normal',1)})
		.mouseout(function(){$(this).fadeTo('normal',0.6)})
		.click(function(){window.open($(div).find("img").attr("src"),"_blank");})
		.fadeTo('normal',0.6);
	/*arrow left*/var al=document.createElement("sub");
	$(al).mouseover(function(){$(this).fadeTo('normal',1)})
		.mouseout(function(){$(this).fadeTo('normal',0.6)})
		.click(function(){o.prev()})
		.fadeTo('normal',0.6);
	/*arrow right*/var ar=document.createElement("sup");
	$(ar).mouseover(function(){$(this).fadeTo('normal',1)})
		.mouseout(function(){$(this).fadeTo('normal',0.6)})
		.click(function(){o.next()})
		.fadeTo('normal',0.6);
	div.appendChild(q);
	div.appendChild(mag);
	div.appendChild(al);
	div.appendChild(ar);
	/*information*/var i=document.createElement("i");
	i.innerHTML=_words('viewerTip');
	div.appendChild(i);
	/*内层的DIV用于放文字说明*/
	var d=document.createElement("div");
	div.appendChild(d);
	$(d).fadeTo(300,0);
	var v=document.createElement("var");
	var dfn=document.createElement("dfn");
	d.appendChild(v);
	d.appendChild(dfn);
	
	var p/*photo*/,t/*timer*/,lw/*last winwidth*/,lh/*last winheight*/;
	
	//关闭动作
	o.shut=function(){hideTitle(true);$(window).unbind("resize",transform);}
	o.prev=function(){
		c--;
		c%=ps.size();
		hideTitle(false,function(){o.play(ps.get(c));});
	}
	o.next=function(){
		c++;
		c%=ps.size();
		hideTitle(false,function(){o.play(ps.get(c));});
	}
	o.play=function(pic){
		c=get(pic);
		CHIbg.show(function(){document.body.appendChild(div);});
		var img=document.createElement("img");
		img.src=pic.lowsrc || pic.src;
		img.alt=pic.alt;
		img.title=pic.title;
		$(img).fadeTo(1,0).click(function(){window.open(this.src,'_blank')});
		div.appendChild(img);
		p=$(img);
		//如果使用拖拽的方法改变窗口大小的话，会形成连续的transform，所以为了保证动画流畅，要延迟执行的时间
		$(window).resize(function(){delay();});
		if(img.complete)transform();
		else img.onload=function(){transform()}
	}
	function delay()
	{
		var w=$(window).width();
		var h=$(window).height();
		if(w!=lw || h!=lh)
		{//如果尺寸改变了，则继续改变下去
			lw=w;lh=h;
			return;
		}
		//如果没改变，则开始计时，半秒后执行transform
		if(t)clearTimeout(t);
		t=setTimeout(function(){transform()},500);
	}
	function transform()
	{
		var w,h;
		/*保存旧的尺寸*/if("ow" in p) w=p.ow;
		else p.ow=w=p.get(0).width;
		if("oh" in p) h=p.oh;
		else p.oh=h=p.get(0).height;
		//窗口的尺寸要减掉对应的间隙
		var ww=$(window).width()-hg*2;
		var wh=$(window).height()-vg*2;
		var bw_h=$(div).outerWidth(true)-$(div).width();
		var bw_v=$(div).outerHeight(true)-$(div).height();
		//最大尺寸是窗口尺寸减掉对应的边框宽度
		var ih=$(i).outerHeight(true);
		var MW=ww-bw_h,MH=wh-bw_v-ih;
		/*div/picture width/height*/var dw,dh,pw,ph;
		/*ratio primary*/var rp=w/h;
		/*ratio maximum*/var rm=MW/MH;
		if(rp>=rm && w>MW)
		{//图片过宽或等比，且宽大于最大宽
			dw=pw=MW;dh=ph=MW*h/w;
		}
		else if(rp<rm && h>MH)
		{//图片过高，且高大于最大高
			dh=ph=MH;dw=pw=MH*w/h;
		}
		else
		{
			dw=pw=w;dh=ph=h;
		}
		dw=Math.max(dw,mw);
		dh=Math.max(dh,mh);
		var x=(ww-dw-bw_h)*0.5+hg;
		var y=(wh-dh-bw_v+ih)*0.5+vg;
		var css={
			"top":y+"px"
			,"left":x+"px"
			,"width":dw+"px"
			,"height":dh+"px"
		};
		p.css({"width":pw+"px","height":ph+"px"});
		p.fadeTo(1,0,function(){showDiv(css)});
	}
	function showDiv(css)
	{
		$(div).fadeTo(300,1).animate(css,'fast','swing',function(){showImg()});
	}
	function showImg()
	{
		p.css({
			  "marginLeft":(p.parent().width()-p.width())*0.5
			  ,"marginTop":(p.parent().height()-p.height())*0.5
			})
			.fadeTo(300,1,function(){showTitle()});
	}
	function showTitle()
	{
		$(v).html(p.attr("alt"));
		$(dfn).html(p.attr("title"));
		$(d).fadeTo(300,1);
		$(div).children("i,q,sub,sup").fadeIn(300);
	}
	function hideTitle(bool,cbfun)
	{
		$(div).children("i,q,sub,sup").fadeOut(300);
		$(d).fadeTo(300,0,function(){hideImg(bool,cbfun);})
	}
	function hideImg(bool,cbfun)
	{
		$(div).find("img").fadeTo(300,0,function(){
			div.removeChild(div.getElementsByTagName("img")[0]);
			if(bool)hideDiv(bool);
			else cbfun();
		});
	}
	function hideDiv(bool)
	{
		var cbfun=function(){document.body.removeChild(div);CHIbg.hide();};
		$(div).fadeTo(300,0,cbfun);
	}
	return o;
}
