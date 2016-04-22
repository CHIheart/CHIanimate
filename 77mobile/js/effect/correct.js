/*
图片列表等比例缩放效果
sJQlist，要执行本特效的图片列表的JQ选择器字符串，支持多个列表
sJQimgs，在$(sJQlist)上使用find来查找到所有img的JQ选择器字符串，默认为'img'
sJQparent，在每个img元素的个体上，使用closest找到最直接可以获取尺寸的父级DOM的JQ选择器字符串，如果为空的话则直接使用$(img).parent()
bFullfill，默认为false，使用最大全图模式，如果为true，使用最小满图模式

配合HTML及CSS，在sJQparent所对应的父级元素中加入如下代码
<samp><i class='fa fa-spinner fa-spin'></i></samp>
可以形成在调用时显示圆圈LOADING的样式，等图片调用完成，并纠正位置之后，再显示图片
这一项需要附加FontAwesome字体样式文件
*/
function CHIpros(sJQlist, sJQimgs, sJQparent, bFullfill) {
	if (!sJQlist || !$(sJQlist).size()) return;
	bFullfill = bFullfill ? true : false;
	if (!sJQimgs) sJQimgs = "img";
	var imgs = $(sJQlist).find(sJQimgs);
	var loading = "<samp><i class='fa fa-spinner fa-spin'></i></samp>";
	imgs.map(function(ind, ele) {
		var p = sJQparent ? $(ele).closest(sJQparent) : $(ele).parent();
		p.append(loading);
		if (ele.complete) messure(ele);
		else $(ele).load(function() {
			messure(this);
		});
	});

	function messure(img) {
		var p = sJQparent ? $(img).closest(sJQparent) : $(img).parent();
		var pw = p.width();
		var ph = p.height();
		var w = $(img).width();
		var h = $(img).height(); /*ratio parent*/
		var rp = pw / ph; /*ratio image*/
		var r = w / h; /*goal width height marginTop marginLeft*/
		var gw, gh, gt, gl;
		//过宽，且宽大于外围宽--满图，高用外围高与图片高之中较小的那个--全图，宽用外围宽
		if (r > rp && w > pw) gw = bFullfill ? (Math.min(ph, h) * w / h) : pw;
		//过高，且高大于外围高---满图，宽用外围宽与图片宽之中较小的那个---全图，高用外围高
		else if (r < rp && h > ph) gw = bFullfill ? Math.min(pw, w) : (w * ph / h);
		else if (r == rp) gw = Math.min(pw, w); //等比例按较小的尺寸计算
		else gw = w; //为了节省代码长度，把计算过程缩写成只先计算宽，高用等比缩的形式
		gh = gw * h / w;
		gt = (ph - gh) * 0.5;
		gl = (pw - gw) * 0.5;
		$(img).css({
			"width": gw,
			"height": gh,
			"marginTop": gt,
			"marginLeft": gl
		});
		p.css({
			"textAlign": "left"
		});

		var samp = p.find("samp");
		if (samp.size()) samp.fadeOut(function() {
			samp.remove()
		});
	}
}
//图片限宽缩小效果
function CHIimgs(sJQimgContainer, piMaxWidth) {
	var imgs = $(sJQimgContainer).find('img').removeAttr("width height");
	if (navigator.appVersion.indexOf("MSIE 6.0") > 0) imgs.map(function(ind, ele) {
		if ($(ele).width() > piMaxWidth) $(ele).width(piMaxWidth);
	});
	else imgs.css({
		"maxWidth": piMaxWidth
	});
}
//自动焦点失焦效果
function CHIblur() {
	$("a,:checkbox,:radio,:button,:submit,:reset,button").focus(function() {
		this.blur();
	});
}