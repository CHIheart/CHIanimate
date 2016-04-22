// 颜色的混合方式计算，primary原始颜色值，mixture要混入的颜色值，mode混合模式
Raphael.mixColor=function(primary,mixture,mode){
	var prgb=this.getRGB(primary),
		mrgb=this.getRGB(mixture),
		f=255,h=128;
	function filter(v){return max(min(f,v),0);}
	function cal(fun)
	{
		return Raphael.rgb(
			filter(fun(prgb.r,mrgb.r)),
			filter(fun(prgb.g,mrgb.g)),
			filter(fun(prgb.b,mrgb.b))
		);
	}
	function sum(color){return color.r+color.g+color.b;}
	switch(mode)
	{
		/*变暗*/case "darken": return cal(function(p,m){return min(p,m);});
		/*正片叠底*/case "multiply": return cal(function(p,m){return p*m/f;});
		/*颜色加深*/case "color burn": return cal(function(p,m){return p-(f-p)*(f-m)/m;});
		/*线性加深*/case "linear burn": return cal(function(p,m){return p+m-f;});
		/*深色*/case "darker": return sum(prgb)<sum(mrgb) ? primary : mixture;
		/*变亮*/case "lighten": return cal(function(p,m){return max(p,m);});
		/*滤色*/case "screen": return cal(function(p,m){return f-(f-p)*(f-m)/f;});
		/*颜色减淡*/case "color dodge": return cal(function(p,m){return p+p*m/(f-m);});
		/*线性减淡*/case "linear dodge": return cal(function(p,m){return p+m;});
		/*浅色*/case "lighter": return sum(prgb)>sum(mrgb) ? primary : mixture;
		/*叠加*/case "overlay": return cal(function(p,m){return p>h ? m*p/h : (f-(f-m)*(f-p))/h;});
		/*柔光*/case "soft light": return cal(function(p,m){return m>h ? p+(2*m-f)*(sqrt(p/f)*f-p)/f : p+(2*m-f)*(p-p*p/f)/f;});
		/*强光*/case "hard light": return cal(function(p,m){return m>h ? f-(f-p)*(f-m)/h : p*m/h;});
		/*亮光*/case "vivid light": return cal(function(p,m){return m>h ? p/2/(f-m)*f : f-(f-p)/2/m*f;});
		/*线性光*/case "linear light": return cal(function(p,m){return 2*m+p-f;});
		/*点光*/case "pin light": return cal(function(p,m){var t=2*m;return p>t ? t : (p>t-255 ? p : t-255);});
		/*实色混合*/case "hard mix": return cal(function(p,m){var t=m+p;return t>f ? f:0;});
		/*差值*/case "difference": return cal(function(p,m){return abs(m-p);});
		/*排除*/case "exclusion": return cal(function(p,m){return p+m-p*m/h;});
	}
}
