/*
简单的瀑布流效果，需要生成实体对象
每个对象单独控制一个图片列表listid
*/
function CHIfalls(listid)
{
	if(!($("#"+listid).size()))return false;
	var o=new Object();
	var t/*target*/=$("#"+listid);
	var k/*kids*/=t.children();
	var heart/*heart*/=document.createElement("div");
	heart=$(heart);
	heart.addClass("CHIinfors");
	var hr=document.createElement("div");
	hr=$(hr);
	hr.addClass("CHIhr");
	t.parent().append(heart).append(hr);
	
	function resize(){
		var ww=$(window).width();
		var n=1;
		if(ww<=480);
		else if(ww<=800)n=2;
		else if(ww<=1200)n=3;
		else if(ww<=1440)n=4;
		else if(ww<=1600)n=5;
		else n=6;
		//如果未变列数，则不重置
		//if(n==heart.children().size())return;
		heart.empty();
		
		for(var i=0;i<n;i++)
		{
			var li=document.createElement("ul");
			heart.append($(li));
		}
		heart.children().css({"width":(100/n)+"%","float":"left"});
		//遍历所有子元素，逐一把它们加到即刻最短的新li里边
		for(var i=0;i<k.size();i++)
		{
			var x=shortest();
			//alert("加第"+i+"个元素，加在第"+x+"个子元素中");
			heart.children().eq(x).append(k[i]);
		}
	}
	function shortest(){//获取即刻的新li中高度最小的li的序号
		var lis=heart.children();
		var minh=lis.eq(0).height(),ind=0;
		for(var i=1;i<lis.size();i++)
		{
			var ht=lis.eq(i).outerHeight(true);
			//alert("第"+i+"个元素的高是"+ht+"，最小高是"+minh);
			if(ht<minh)
			{
				//alert("序号换成"+i);
				ind=i;
				minh=ht;
			}
		}//alert("最后找到"+ind);
		return ind;
	}
	$(window).load(resize);
	$(window).resize(resize);
	return o;
}
