//颜色类函数
define(function(require,exports,module){
	var N=require("./N");
	var C={
		//HTML合法颜色值
		reg:{
			rgb:/^rgb\((\d{1,3})\,(\d{1,3})\,(\d{1,3})\)$/i,
			rgba:/^rgba\((\d{1,3})\,(\d{1,3})\,(\d{1,3})\,(0|0?\.\d+|1)\)$/i,
			hex3:/^#([\da-f])([\da-f])([\da-f])$/i,
			hex6:/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,
			hsl:/^hsl\((\d{1,3})\,((?:\d{1,2}(?:\.\d+)?|\d{0,2}\.\d+)\%)\,((?:\d{1,2}(?:\.\d+)?|\d{0,2}\.\d+)\%)\)$/i,
			hsla:/^hsla\((\d{1,3})\,((?:\d{1,2}(?:\.\d+)?|\d{0,2}\.\d+)\%)\,((?:\d{1,2}(?:\.\d+)?|\d{0,2}\.\d+)\%)\,(0|0?\.\d+|1)\)$/i,
			transparent:/^transparent$/i,
			inherit:/^inherit$/i
		},
		//HTML合法颜色名及其RGB值
		names:{
			AliceBlue:"rgb(240,248,255)",
			AntiqueWhite:"rgb(250,235,215)",
			Aqua:"rgb(0,255,255)",
			Aquamarine:"rgb(127,255,212)",
			Azure:"rgb(240,255,255)",
			Beige:"rgb(245,245,220)",
			Bisque:"rgb(255,228,196)",
			Black:"rgb(0,0,0)",
			BlanchedAlmond:"rgb(255,235,205)",
			Blue:"rgb(0,0,255)",
			BlueViolet:"rgb(138,43,226)",
			Brown:"rgb(165,42,42)",
			BurlyWood:"rgb(222,184,135)",
			CadetBlue:"rgb(95,158,160)",
			Chartreuse:"rgb(127,255,0)",
			Chocolate:"rgb(210,105,30)",
			Coral:"rgb(255,127,80)",
			CornflowerBlue:"rgb(100,149,237)",
			Cornsilk:"rgb(255,248,220)",
			Crimson:"rgb(220,20,60)",
			Cyan:"rgb(0,255,255)",
			DarkBlue:"rgb(0,0,139)",
			DarkCyan:"rgb(0,139,139)",
			DarkGoldenRod:"rgb(184,134,11)",
			DarkGray:"rgb(169,169,169)",
			DarkGreen:"rgb(0,100,0)",
			DarkKhaki:"rgb(189,183,107)",
			DarkMagenta:"rgb(139,0,139)",
			DarkOliveGreen:"rgb(85,107,47)",
			DarkOrange:"rgb(255,140,0)",
			DarkOrchid:"rgb(153,50,204)",
			DarkRed:"rgb(139,0,0)",
			DarkSalmon:"rgb(233,150,122)",
			DarkSeaGreen:"rgb(143,188,143)",
			DarkSlateBlue:"rgb(72,61,139)",
			DarkSlateGray:"rgb(47,79,79)",
			DarkTurquoise:"rgb(0,206,209)",
			DarkViolet:"rgb(148,0,211)",
			DeepPink:"rgb(255,20,147)",
			DeepSkyBlue:"rgb(0,191,255)",
			DimGray:"rgb(105,105,105)",
			DodgerBlue:"rgb(30,144,255)",
			FireBrick:"rgb(178,34,34)",
			FloralWhite:"rgb(255,250,240)",
			ForestGreen:"rgb(34,139,34)",
			Fuchsia:"rgb(255,0,255)",
			Gainsboro:"rgb(220,220,220)",
			GhostWhite:"rgb(248,248,255)",
			Gold:"rgb(255,215,0)",
			GoldenRod:"rgb(218,165,32)",
			Gray:"rgb(128,128,128)",
			Green:"rgb(0,128,0)",
			GreenYellow:"rgb(173,255,47)",
			HoneyDew:"rgb(240,255,240)",
			HotPink:"rgb(255,105,180)",
			IndianRed:"rgb(205,92,92)",
			Indigo:"rgb(75,0,130)",
			Ivory:"rgb(255,255,240)",
			Khaki:"rgb(240,230,140)",
			Lavender:"rgb(230,230,250)",
			LavenderBlush:"rgb(255,240,245)",
			LawnGreen:"rgb(124,252,0)",
			LemonChiffon:"rgb(255,250,205)",
			LightBlue:"rgb(173,216,230)",
			LightCoral:"rgb(240,128,128)",
			LightCyan:"rgb(224,255,255)",
			LightGoldenRodYellow:"rgb(250,250,210)",
			LightGray:"rgb(211,211,211)",
			LightGreen:"rgb(144,238,144)",
			LightPink:"rgb(255,182,193)",
			LightSalmon:"rgb(255,160,122)",
			LightSeaGreen:"rgb(32,178,170)",
			LightSkyBlue:"rgb(135,206,250)",
			LightSlateGray:"rgb(119,136,153)",
			LightSteelBlue:"rgb(176,196,222)",
			LightYellow:"rgb(255,255,224)",
			Lime:"rgb(0,255,0)",
			LimeGreen:"rgb(50,205,50)",
			Linen:"rgb(250,240,230)",
			Magenta:"rgb(255,0,255)",
			Maroon:"rgb(128,0,0)",
			MediumAquaMarine:"rgb(102,205,170)",
			MediumBlue:"rgb(0,0,205)",
			MediumOrchid:"rgb(186,85,211)",
			MediumPurple:"rgb(147,112,219)",
			MediumSeaGreen:"rgb(60,179,113)",
			MediumSlateBlue:"rgb(123,104,238)",
			MediumSpringGreen:"rgb(0,250,154)",
			MediumTurquoise:"rgb(72,209,204)",
			MediumVioletRed:"rgb(199,21,133)",
			MidnightBlue:"rgb(25,25,112)",
			MintCream:"rgb(245,255,250)",
			MistyRose:"rgb(255,228,225)",
			Moccasin:"rgb(255,228,181)",
			NavajoWhite:"rgb(255,222,173)",
			Navy:"rgb(0,0,128)",
			OldLace:"rgb(253,245,230)",
			Olive:"rgb(128,128,0)",
			OliveDrab:"rgb(107,142,35)",
			Orange:"rgb(255,165,0)",
			OrangeRed:"rgb(255,69,0)",
			Orchid:"rgb(218,112,214)",
			PaleGoldenRod:"rgb(238,232,170)",
			PaleGreen:"rgb(152,251,152)",
			PaleTurquoise:"rgb(175,238,238)",
			PaleVioletRed:"rgb(219,112,147)",
			PapayaWhip:"rgb(255,239,213)",
			PeachPuff:"rgb(255,218,185)",
			Peru:"rgb(205,133,63)",
			Pink:"rgb(255,192,203)",
			Plum:"rgb(221,160,221)",
			PowderBlue:"rgb(176,224,230)",
			Purple:"rgb(128,0,128)",
			Red:"rgb(255,0,0)",
			RosyBrown:"rgb(188,143,143)",
			RoyalBlue:"rgb(65,105,225)",
			SaddleBrown:"rgb(139,69,19)",
			Salmon:"rgb(250,128,114)",
			SandyBrown:"rgb(244,164,96)",
			SeaGreen:"rgb(46,139,87)",
			SeaShell:"rgb(255,245,238)",
			Sienna:"rgb(160,82,45)",
			Silver:"rgb(192,192,192)",
			SkyBlue:"rgb(135,206,235)",
			SlateBlue:"rgb(106,90,205)",
			SlateGray:"rgb(112,128,144)",
			Snow:"rgb(255,250,250)",
			SpringGreen:"rgb(0,255,127)",
			SteelBlue:"rgb(70,130,180)",
			Tan:"rgb(210,180,140)",
			Teal:"rgb(0,128,128)",
			Thistle:"rgb(216,191,216)",
			Tomato:"rgb(255,99,71)",
			Turquoise:"rgb(64,224,208)",
			Violet:"rgb(238,130,238)",
			Wheat:"rgb(245,222,179)",
			White:"rgb(255,255,255)",
			WhiteSmoke:"rgb(245,245,245)",
			Yellow:"rgb(255,255,0)",
			YellowGreen:"rgb(154,205,50)"
		},
		name2color:function(name){
			if(!name || this.type(name)!='names') return false;
			for(var n in this.names) if(n.toLowerCase()==name.toLowerCase()) return this.names[n];
		},
		//是否为rgb颜色
		isRGBobj:function(o){
			return typeof o == "object" && "r" in o && "b" in o && "g" in o;
		},
		//是否为hsl颜色
		isHSLobj:function(o){
			return typeof o == "object" && "h" in o && "s" in o && "l" in o;
		},
		//将颜色转化为字符串，第二参是当o是transparent时的参照对象，会取它的rgb或hsl值
		toString:function(o,template){
			if(this.isRGBobj(o)){
				if(o.r===null) o.r=template.r,o.g=template.g,o.b=template.b;
				return ['rgba(',o.r,',',o.g,',',o.b,',',("a" in o ? o.a : 1),')'].join('');	
			}
			if(this.isHSLobj(o)){
				if(o.h===null) o.h=template.h,o.s=template.s,o.l=template.l;
				return ['hsla(',o.h,',',o.s,',',o.l,',',("a" in o ? o.a : 1),')'].join('');	
			}
			if(this.type(o)) return o;
			return false;
		},
		//将颜色转化为对象
		toObject:function(str){
			var type=this.type(str);
			if(this.isRGBobj(str) || this.isHSLobj(str))
			{
				!("a" in str) && (str.a=1);
				return str;
			}
			if(!type) return false;
			if(type=='transparent') return {
				r:null,
				g:null,
				b:null,
				a:0
			}
			if(type=='inherit') return str;
			var arr=str.match(this.reg[type]);
			switch(type)
			{
				case "rgb":
				case "rgba":
					return {
						r: arr[1] * 1,
						g: arr[2] * 1,
						b: arr[3] * 1,
						a: arr.length==5 ? arr[4] * 1.0 : 1
					};
				case "hex3":
					return {
						r: eval("0x"+arr[1]+arr[1]),
						g: eval("0x"+arr[2]+arr[2]),
						b: eval("0x"+arr[3]+arr[3]),
						a: 1
					}
				case "hex6":
					return {
						r: eval("0x"+arr[1]),
						g: eval("0x"+arr[2]),
						b: eval("0x"+arr[3]),
						a: 1
					}
				case "hsl":
				case "hsla":
					return {
						h: Number(arr[1]),
						s: arr[2],
						l: arr[3],
						a: arr.length==5 ? arr[4] : 1
					};
				case "names":
					return this.toObject(this.name2color(str));
			}
		},
		//返回颜色类型或数值类型（正则表达式名），缺省null则返回null
		type:function(str){
			if(str===null) return null;
			for(var n in this.reg)
			{
				if(this.reg[n].test(str)) return n;
			}
			if(this.isRGBobj(str)) return 'rgb';
			if(this.isHSLobj(str)) return 'hsl';
			return false;
		},
		rgb2hsl:function (rgba){
			var r=rgba.r/255,
				g=rgba.g/255,
				b=rgba.b/255,
				minv=Math.min(r,g,b),
				maxv=Math.max(r,g,b),
				delta=maxv-minv,
				sum=maxv+minv,
				h,s,l;
			l=sum/2;
			if ( minv === maxv ) {
				h = 0;
			} else if ( r === maxv ) {
				h = ( 60 * ( g - b ) / delta ) + 360;
			} else if ( g === maxv ) {
				h = ( 60 * ( b - r ) / delta ) + 120;
			} else {
				h = ( 60 * ( r - g ) / delta ) + 240;
			}

			// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
			// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
			if ( delta === 0 ) {
				s = 0;
			} else if ( l <= 0.5 ) {
				s = delta / sum;
			} else {
				s = delta / ( 2 - sum );
			}
			return {
				h:h,
				s:N.float2per(s),
				l:N.float2per(l),
				a:rgba.a
			}
		},
		hsl2rgb:function (hsla){
			var h = hsla.h / 360,
				s = perToFloat(hsla.s),
				l = perToFloat(hsla.l),
				q = l <= 0.5 ? l * ( 1 + s ) : l + s - l * s,
				p = 2 * l - q;

			return {
				r:Math.round( hue2RGB( p, q, h + ( 1 / 3 ) ) * 255 ),
				g:Math.round( hue2RGB( p, q, h ) * 255 ),
				b:Math.round( hue2RGB( p, q, h - ( 1 / 3 ) ) * 255 ),
				a:hsla.a
			}
			function hue2RGB( p, q, h ) {
				h = ( h + 1 ) % 1;
				if ( h * 6 < 1 ) {
					return p + (q - p) * h * 6;
				}
				if ( h * 2 < 1) {
					return q;
				}
				if ( h * 3 < 2 ) {
					return p + (q - p) * ((2/3) - h) * 6;
				}
				return p;
			}
		}
	};
	(function(){
		var names=[];
		for(var n in C.names) names.push(n);
		C.reg.names=new RegExp(['^',names.join('|'),'$'].join(''),"i");
	})();
	return C;
});