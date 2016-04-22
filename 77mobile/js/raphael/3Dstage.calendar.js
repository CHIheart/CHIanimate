// 操作正12面体日历需要用到的函数
//根据当前面及目标面返回rotate3D的第一参数数组
function getParams(from,to)
{
	var phi=(sqrt(5)-1)/2,
		c1624=.1624598481164531,
		c1875=.18759247408508017,
		c2628=.2628655560595665,
		c2763=.2763932022500211,
		c3035=.3035309991033432,
		c3090=.3090169943749475,
		c3568=.35682208977309005,
		c4253=.42532540417602,
		c4472=.447213595499958,
		c4911=.4911234731884232,
		c5257=.5257311121191335,
		c5773=.5773502691896258,
		c5877=.5877852522924732,
		c6070=.6070619982066866,
		c6881=.6881909602355868,
		c7236=.7236067977499792,
		c7946=.7946544722917661,
		c8090=.8090169943749475,
		c8506=.85065080835204,
		c8944=.894427190999916,
		c9341=.9341723589627157,
		c9510=.9510565162951535,
		c9822=.9822469463768462
	;
	switch(from+'-'+to)
	{
		case "1-7":
		case "3-6":
			return [0,c1875,c9822,120];
		case "7-1":
		case "6-3":
			return [0,c1875,c9822,-120];
		case "2-3":
		case "3-4":
		case "4-5":
		case "9-10":
			return [0,-c4472,c8944,72];
		case "3-2":
		case "4-3":
		case "5-4":
		case "10-9":
			return [0,-c4472,c8944,-72];
		case "1-6":
		case "2-4":
		case "3-5":
		case "5-2":
			return [0,-c4472,c8944,144];
		case "6-1":
		case "4-2":
		case "5-3":
		case "2-5":
			return [0,-c4472,c8944,-144];
		case "5-10":
		case "10-5":
			return [0, c5257, c8506, 180];
		case "1-5":
		case "5-1":
			return [0,c8506,-c5257,180];
		case "2-8":
		case "3-7":
			return [0,c7946,c6070,120];
		case "8-2":
		case "7-3":
			return [0,c7946,c6070,-120];
		case "2-6":
		case "6-2":
			return [c3090,0,c9510,180];
		case "7-12":
		case "12-7":
			return [c3090,0,-c9510,180];
		case "5-11":
		case "11-5":
		case "6-10":
		case "10-6":
			return [c3090, c8506, c4253, 180];
		case "1-4":
		case "8-10":
			return [-c3568,-c7946,c4911,120];
		case "4-1":
		case "10-8":
			return [-c3568,-c7946,c4911,-120];
		case "5-12":
		case "12-5":
		case "6-11":
		case "11-6":
		case "7-10":
		case "10-7":
			return [0.5, c8506, -c1624, 180];
		case "6-12":
		case "12-6":
		case "7-11":
		case "11-7":
			return [0.5, c5257, -c6881, 180];
		case "12-1":
		case "4-6":
		case "9-11":
			return [-c5257,c4472,c7236,72];
		case "1-12":
		case "6-4":
		case "11-9":
			return [-c5257,c4472,c7236,-72];
		case "1-8":
		case "8-12":
			return [-c5257,c4472,c7236,144];
		case "8-1":
		case "12-8":
			return [-c5257,c4472,c7236,-144];
		case "2-7":
		case "10-4":
		case "5-9":
			return [c5257,c4472,c7236,144];
		case "7-2":
		case "4-10":
		case "9-5":
			return [c5257,c4472,c7236,-144];
		case "8-11":
			return [-c5773,-c1875,c7946,120];
		case "11-8":
			return [-c5773,-c1875,c7946,-120];
		case "2-9":
		case "12-2":
		case "3-8":
		case "4-7":
		case "9-12":
			return [-c5773,c7946,c1875,120];
		case "9-2":
		case "2-12":
		case "8-3":
		case "7-4":
		case "12-9":
			return [-c5773,c7946,c1875,-120];
		case "4-9":
		case "9-4":
		case "5-8":
		case "8-5":
			return [c8090, 0, c5877, 180];
		case "1-9":
		case "2-11":
		case "9-1":
		case "11-2":
			return [c8090, -c5257, -c2628,180];
		case "4-11":
		case "11-4":
		case "6-9":
		case "9-6":
			return [c8090, c5257, c2628, 180];
		case "1-2":
		case "5-6":
		case "6-7":
		case "10-11":
		case "11-12":
			return [-c8506,c4472,-c2763,72];
		case "2-1":
		case "6-5":
		case "7-6":
		case "11-10":
		case "12-11":
			return [-c8506,c4472,-c2763,-72];
		case "3-9":
		case "4-8":
		case "5-7":
		case "10-12":
			return [-c8506,c4472,-c2763,144];
		case "9-3":
		case "8-4":
		case "7-5":
		case "12-10":
			return [-c8506,c4472,-c2763,-144];
		case "7-8":
		case "8-9":
		case "1-3":
			return [-c8506,-c4472,c2763,72];
		case "8-7":
		case "9-8":
		case "3-1":
			return [-c8506,-c4472,c2763,-72];
		case "4-12":
		case "9-7":
			return [c8506,c4472,-c2763,144];
		case "12-4":
		case "7-9":
			return [c8506,c4472,-c2763,-144];
		case "1-11":
		case "10-2":
		case "3-12":
			return [c9341,-c1875,-c3035,120];
		case "11-1":
		case "2-10":
		case "12-3":
			return [c9341,-c1875,-c3035,-120];
		case "3-10":
		case "6-8":
			return [c9341,c1875,c3035,-120];
		case "10-3":
		case "8-6":
			return [c9341,c1875,c3035,120];
		case "1-10":
		case "3-11":
		case "10-1":
		case "11-3":
			return [1,0,0,180];
		case "0-1"://这一句是从原始数据点到第一正面的旋转参数
			return [0.24081865259792187,0.8477170626257355,0.47263321751027676,62.01645084227492];
	}
}
