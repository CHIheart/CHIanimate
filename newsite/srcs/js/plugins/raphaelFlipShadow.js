/*
使用Raphael画的翻角效果
要包含RaphaelJS库
扩展了paper.angle(6个数字即三对坐标)，且生成的路径可以使用angle.flipShadow()方法
angle.flipShadow(options,duration,easing,callback)
其中 options 为JSON对象，可以含有属性
	reversed，默认为false，为撕开效果，否则为合回效果
	original，默认为0，还可以为1或2，从哪个点开始撕
*/
define(function(require,exports,module){
	if(typeof Raphael=='undefined') return false;
	function fix(n){
		var x=new Number(n);
		return x.toFixed(2);
	}
	Raphael.fn.angle=function(x1,y1,x2,y2,x3,y3){
		return this.path("M0,0Z").attr({
			stroke:false,
			fill:"#000",
			opacity:.3
		})
		.data({
			ps:[
				[x1,y1],
				[x2,y2],
				[x3,y3]
			],
			shadow:this.path("M0,0Z").attr({
				stroke:false,
				fill:"#fff",
				opacity:.3
			}),
			original:0
		})
		.onAnimation(function(){
			var curpath=this.attr("path");
			if(typeof curpath=="string")
			{
				/*
				IE的VML返回的路径是字符串，而SVG是数组的数组
				M
					234,194.65276767181655,
				C
					234,194.65276767181655,
					233.39234342567897,195,
					233.39234342567897,195,
				C
					233.39234342567897,195,
					233.70084599418044,194.47648048981574,
					233.70084599418044,194.47648048981574,
				C
					233.70084599418044,194.47648048981574,
					234,194.65276767181655,
					234,194.65276767181655
				*/
				var a=curpath.split(" ");
				if(a.length>10)
				{//计算中的路径会分割成很长的数组
					var x1=a[1],
						y1=a[2],
						x2=a[6],
						y2=a[7],
						x3=a[13],
						y3=a[14];
				}
				else
				{//终点路径只有三个点
					a=curpath.split(/[a-z,]/i);
					var x1=a[0],
						y1=a[1],
						x2=a[2],
						y2=a[3],
						x3=a[4],
						y3=a[5];
				}
			}
			else
			{
				var d1=curpath[0],
					x1=d1[1],
					y1=d1[2],
					d2=curpath[1],
					x2=d2[1],
					y2=d2[2],
					d3=curpath[2],
					x3=d3[1],
					y3=d3[2];
			}
			var b=x1==x2 && y1==y2,
				o=this.data('ps')[this.data('original')],
				str=Raphael.format(
					"M{0},{1}L{2},{3}L{4},{5}Z",
					o[0],o[1],
					x1,y1,
					b?x3:x2,b?y3:y2
				);
			this.data("shadow").attr({path:str});
		});
	}
	/*
	一个三角形，从一点（力点）“撕到”另外两点（柄点）的效果
	options，配置参数集合对象，可以使用的键名有
		reversed，是否撕开，默认为false，是撕开的效果，如果为true则是从撕开倒退回还原的效果
		original，力点，默认为0，是三角形中第一顶点，还可以为1或2
	*/
	Raphael.el.flipShadow=function(options,duration,easing,callback){
		var ps=this.data("ps");
		if(!ps || !ps.length) return;
		typeof options !="object" && (options={});
		duration=isNaN(duration) || duration*1<0 ? 1000 : Math.round(duration);
		!easing && (easing='>');
		!(callback instanceof Function) && (callback=function(){});
		//获取正反参数，及力点参数（另外两个点为柄点）
		var reversed= options.reversed ? Boolean(options.reversed) : false,
			original= options.original,
			paper=this.paper,
			handle1,handle2;
		(isNaN(original) || original>ps.length) && (original=0);
		switch(original)
		{
			case 0:
				handle1=1;
				handle2=2;
				break;
			case 1:
				handle1=0;
				handle2=2;
				break;
			case 2:
				handle1=0;
				handle2=1;
				break;
		}
		//计算过程
		var o=ps[original],
			h1=ps[handle1],
			h2=ps[handle2],
			sqrt=Math.sqrt,
			module=function(vec){
				return sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
			},
			v_oh1=[h1[0]-o[0],h1[1]-o[1]],
			m_oh1=module(v_oh1),
			v_oh2=[h2[0]-o[0],h2[1]-o[1]],
			m_oh2=module(v_oh2),
			v_h1h2=[h2[0]-h1[0],h2[1]-h1[1]],
			m_h1h2=module(v_h1h2),
			p=(m_oh1+m_oh2+m_h1h2)/2,//海伦公式
			size=sqrt(p * (p- m_oh1)*(p- m_oh2)*(p- m_h1h2)),
			m_og=4*size/m_h1h2,
			v_og_n=[-v_h1h2[1],v_h1h2[0]],//[x,y]垂直于[-y,x]
			m_og_n=module(v_og_n),
			uv_og=[v_og_n[0]/m_og_n,v_og_n[1]/m_og_n],
			v_og_1=[uv_og[0]*m_og,uv_og[1]*m_og],
			v_og_2=[-v_og_1[0],-v_og_1[1]],
			g1=[v_og_1[0]+o[0],v_og_1[1]+o[1]],
			g2=[v_og_2[0]+o[0],v_og_2[1]+o[1]],
			v_h1g1=[g1[0]-h1[0],g1[1]-h1[1]],
			m_h1g1=module(v_h1g1),
			g=fix(m_h1g1)==fix(m_oh1) ? g1: g2,
			black_terminal=Raphael.format("M{0},{1}L{2},{3}L{4},{5}Z",h1[0],h1[1],h2[0],h2[1],g[0],g[1]),
			white_terminal=Raphael.format("M{0},{1}L{2},{3}L{4},{5}Z",h1[0],h1[1],h2[0],h2[1],o[0],o[1]),
			path_0=Raphael.format("M{0},{1}L{0},{1}L{0},{1}Z",o[0],o[1]);
		this.data("shadow").attr({path:reversed ? white_terminal : path_0});
		this.attr({
			path:reversed ? black_terminal : path_0
		}).data({
			original:original
		})
		.animate({path: reversed ? path_0 : black_terminal},duration,easing,callback);
	}
	return 123;
});

