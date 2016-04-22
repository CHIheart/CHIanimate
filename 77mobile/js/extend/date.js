//对JavaScript的Date类型的扩展
//非法日期，在IE上返回NaN，其它则为Invalid Date
Date.error = function(D) {
	return isNaN(D) || D == 'Invalid Date';
}
Date.prototype.error = function() {
	return isNaN(this) || this == 'Invalid Date';
}
//合法的年数，只要是正整数就可以
Date.isYear = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n > 0 && Math.round(n) == n;
}
//合法的月数，是在1-12之间的整数
Date.isMonth = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n > 0 && n < 13 && Math.round(n) == n;
}
//合法的天数，是在1-31之间的整数
Date.isDate = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n > 0 && n < 32 && Math.round(n) == n;
}
//合法的日数，是在1-366之间的整数
Date.isDay = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n > 0 && n < 366 && Math.round(n) == n;
}
//合法的周数，是在1-52之间的整数
Date.isWeek = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n > 0 && n < 53 && Math.round(n) == n;
}
//合法的星期数，是在0-6之间的整数
Date.isWeekday = function(n) {
	n = parseInt(n);
	return !isNaN(n) && n >= 0 && n < 7 && Math.round(n) == n;
}
/*
格式化时间串，pattern采用字符串，每个关键字需要用{}括起来
默认的格式 {YYYY}-{MM}-{DD} {hh}:{mm}:{ss}
YYYY，四位年
YY，后两位年
M，月份（加过1的）
MM，双位月（加过1的）
mon，月份英文缩写
MON，月份英文全称
D，日数
DD，双位日
h，小时（24时制）
hh，双位小时（24时制）
H，小时（12时制）
HH，双位小时（12时制）
m，分钟
mm，双位分
s，秒
ss，双位秒
w，数字星期（0-6）
W，汉字星期数（日，一到六）
ww，星期英文缩写
WW，星期英文全称
n，英文上下午小写，am/pm
N，汉字上午/下午
*/
Date.format = function(date, pattern) {
	if (!pattern) pattern = '{YYYY}-{MM}-{DD} {hh}:{mm}:{ss}';

	function fill(n) {
		return n < 10 ? '0' + n : n;
	}
	var D = new Date(date);
	if (Date.error(D)) return false;
	var o = {
		YYYY: D.getFullYear(),
		YY: D.getFullYear().toString().substring(2),
		M: D.getMonth() + 1,
		D: D.getDate(),
		h: D.getHours(),
		m: D.getMinutes(),
		s: D.getSeconds(),
		w: D.getDay(),
		MM: '',
		mon: '',
		MON: '',
		DD: '',
		hh: '',
		H: '',
		HH: '',
		mm: '',
		ss: '',
		ww: '',
		W: '',
		WW: '',
		n: '',
		N: ''
	};
	o.MM = fill(o.M);
	switch (o.m) {
	case 1:
		o.mon = 'Jan';
		o.MON = 'January';
		break;
	case 2:
		o.mon = 'Feb';
		o.MON = 'February';
		break;
	case 3:
		o.mon = 'Mar';
		o.MON = 'March';
		break;
	case 4:
		o.mon = 'Apr';
		o.MON = 'April';
		break;
	case 5:
		o.mon = 'May';
		o.MON = 'May';
		break;
	case 6:
		o.mon = 'Jun';
		o.MON = 'June';
		break;
	case 7:
		o.mon = 'Jul';
		o.MON = 'July';
		break;
	case 8:
		o.mon = 'Aug';
		o.MON = 'August';
		break;
	case 9:
		o.mon = 'Sep';
		o.MON = 'September';
		break;
	case 10:
		o.mon = 'Oct';
		o.MON = 'October';
		break;
	case 11:
		o.mon = 'Nov';
		o.MON = 'November';
		break;
	case 12:
		o.mon = 'Dec';
		o.MON = 'December';
		break;
	}
	switch (o.w) {
	case 0:
		o.ww = 'Sun';
		o.W = '日';
		o.WW = 'Sunday';
		break;
	case 1:
		o.ww = 'Mon';
		o.W = '一';
		o.WW = 'Monday';
		break;
	case 2:
		o.ww = 'Tue';
		o.W = '二';
		o.WW = 'Tuesday';
		break;
	case 3:
		o.ww = 'Wed';
		o.W = '三';
		o.WW = 'Wednesday';
		break;
	case 4:
		o.ww = 'Thu';
		o.W = '四';
		o.WW = 'Thursday';
		break;
	case 5:
		o.ww = 'Fri';
		o.W = '五';
		o.WW = 'Friday';
		break;
	case 6:
		o.ww = 'Sat';
		o.W = '六';
		o.WW = 'Saturday';
		break;
	}
	o.DD = fill(o.D);
	o.hh = fill(o.h);
	o.H = o.h > 12 ? o.h - 12 : o.h;
	o.HH = fill(o.H);
	o.n = o.h > 12 ? 'pm' : 'am';
	o.N = o.h > 12 ? '下午' : '上午';
	o.mm = fill(o.m);
	o.ss = fill(o.s);

	for (var x in o) {
		var reg = new RegExp("{" + x + "}", "g");
		pattern = pattern.replace(reg, o[x]);
	}
	return pattern;
}
Date.prototype.format = function(pattern) {
	return this.error() ? false : Date.format(this, pattern);
}
Date.date = function(pattern) {
	if (!pattern) pattern = '{YYYY}-{MM}-{DD}';
	return Date.format(new Date(), pattern);
}
Date.prototype.date = function(pattern) {
	if (!pattern) pattern = '{YYYY}-{MM}-{DD}';
	return this.error() ? false : Date.format(this, pattern);
}
Date.time = function(pattern) {
	if (!pattern) pattern = '{hh}:{mm}:{ss}';
	return Date.format(new Date(), pattern);
}
Date.prototype.time = function(pattern) {
	if (!pattern) pattern = '{hh}:{mm}:{ss}';
	return this.error() ? false : Date.format(this, pattern);
}
Date.year = function() {
	return (new Date()).getFullYear();
}
Date.month = function() {
	return (new Date()).getMonth() + 1;
}
Date.day = function() {
	return (new Date()).getDate();
}
Date.hour = function() {
	return (new Date()).getHours();
}
Date.minute = function() {
	return (new Date()).getMinutes();
}
Date.second = function() {
	return (new Date()).getSeconds();
}
Date.weekday = function() {
	return (new Date()).getDay();
}
//返回当前时间
Date.now = function() {
	return Date.date() + ' ' + Date.time();
}
//返回某年某月最大天数，不指定月则使用当月，不指定年则使用本年
Date.daysOfMonth = function(month, year) {
	if (year && !Date.isYear(year) || month && !Date.isMonth(month)) return false;
	if (!month) month = Date.month();
	if (!year) year = Date.year();
	var m;
	switch (month) {
	case 1:
	case 3:
	case 5:
	case 7:
	case 8:
	case 10:
	case 12:
		return 31;
	case 4:
	case 6:
	case 9:
	case 11:
		return 30;
	case 2:
		if (year % 400 == 0 || year % 100 != 0 && year % 4 == 0) return 29;
		return 28
	}
	return false;
}
Date.prototype.daysOfMonth = function() {
	return this.error() ? false : Date.daysOfMonth(this.getMonth() + 1);
}
//返回某年是否是闰年
Date.leap = function(year) {
	return Date.isYear(year) ? (year % 400 == 0 || year % 100 != 0 && year % 4 == 0) : false;
}
Date.prototype.leap = function() {
	return this.error() ? false : Date.leap(this.getFullYear());
}
//返回本年最大天数
Date.daysOfYear = function(year) {
	return Date.leap(year) ? 366 : 365;
}
Date.prototype.daysOfYear = function() {
	return this.error() ? false : Date.daysOfYear(this.getFullYear());
}
/*
日期与时间的计算法则
日期与时间都可以进行加减法
日期可以计算年/月/周/日
时间可以计算时/分/秒
如果在纯日期上进行时间计算，则取日期的0:0:0时间
但不可以在纯时间上做日期的计算
*/
/*
日期加法，在日期date上加num，单位是unit
num，必须是十进制整数，可正可负
unit，时间单位，默认为d日数，为下列之一
	year,y,month,mon,week,w,day,d,hour,h,minute,m,second,s
返回一个Date对象
*/
Date.add = function(date, num, unit) {
	if (unit && (typeof unit != 'string' || ',year,y,month,mon,week,w,day,d,hour,h,minute,m,second,s,'.indexOf(',' + unit.toLowerCase() + ',') < 0)) return false;
	num = parseInt(num);
	if (!num && num !== 0 && num !== '0' || isNaN(num)) return false;

	var D = new Date(date);
	if (Date.error(D)) return false;
	if (!unit) unit = 'd';
	unit = unit.toLowerCase();
	switch (unit) {
	case 'month':
	case 'mon':
		var y = Math.floor(num / 12) + D.getFullYear();
		var m = (num + 12) % 12 + D.getMonth();
		D.setYear(y);
		D.setMonth(m);
		break;
	case 'year':
	case 'y':
		D.setYear(D.getFullYear() + num)
		break;
	default:
		var t = num;
		switch (unit) {
		case 'week':
		case 'w':
			t *= 7;
		case 'day':
		case 'd':
			t *= 24;
		case 'hour':
		case 'h':
			t *= 60;
		case 'minute':
		case 'm':
			t *= 60;
		case 'second':
		case 's':
			t *= 1e3;
		}
		D.setTime(D.getTime() + t);
	}
	return D;
}
Date.prototype.add = function(num, unit) {
	return this.error() ? false : Date.add(this, num, unit);
}
//返回今天昨天明天的默认格式日期或日期对象
Date.today = function() {
	var d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
Date.prototype.today = function() {
	return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}
Date.yesterday = function(n) {
	if (!n) n = 1;
	n = parseInt(n);
	if (isNaN(n)) return false;
	var d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
}
Date.prototype.yesterday = function(n) {
	if (!n) n = 1;
	n = parseInt(n);
	if (isNaN(n) || this.error()) return false;
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() - n);
}
Date.tomorrow = function(n) {
	if (!n) n = 1;
	n = parseInt(n);
	if (isNaN(n)) return false;
	var d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
Date.prototype.tomorrow = function(n) {
	if (!n) n = 1;
	n = parseInt(n);
	if (isNaN(n) || this.error()) return false;
	return new Date(this.getFullYear(), this.getMonth(), this.getDate() + n);
}
/*
计算两个时间参数的差值，默认认为参数2比参数1大时返回正数
unit，时间单位，默认为d日数，为下列之一
	week,w,day,d,hour,h,minute,m,second,s
*/
Date.differ = function(date1, date2, unit) {
	if (unit && (typeof unit != 'string' || ',week,w,day,d,hour,h,minute,m,second,s,'.indexOf(',' + unit.toLowerCase() + ',') < 0)) return false;
	var d1 = new Date(date1),
		d2 = new Date(date2);
	if (Date.error(d1) || Date.error(d2)) return false;
	if (!unit) unit = 'd';
	unit = unit.toLowerCase();
	var t = 1; /*divisor*/
	switch (unit) {
	case 'week':
	case 'w':
		t *= 7;
	case 'day':
	case 'd':
		t *= 24;
	case 'hour':
	case 'h':
		t *= 60;
	case 'minute':
	case 'm':
		t *= 60;
	case 'second':
	case 's':
		t *= 1e3;
	}
	return (d2.getTime() - d1.getTime()) / t;
}
Date.prototype.differ = function(date, unit) {
	return this.error() ? false : Date.differ(date, this, unit);
}
/*
获取某年第一个星期日
按照第一个星期日所在的周为本年的第一周
*/
Date.firstSundayOfYear = function(year) {
	var b = Date.isYear(year);
	if (year && !b) return false;
	var D = new Date();
	D.setDate(1);
	D.setMonth(0);
	if (b) D.setYear(year);
	D.setDate((7 - D.getDay()) % 7 + 1);
	return new Date(D.getFullYear(), D.getMonth(), D.getDate());
}
Date.prototype.firstSundayOfYear = function() {
	return this.error() ? false : Date.firstSundayOfYear(this.getFullYear());
}
/*
获取某月第一个星期日
按照第一个星期日所在的周为本月的第一周
*/
Date.firstSundayOfMonth = function(month, year) {
	var bm = Date.isMonth(month),
		by = Date.isYear(year);
	if (year && !by || month && !bm) return false;
	var D = new Date();
	D.setDate(1);
	if (bm) D.setMonth(month - 1);
	if (by) D.setYear(year);
	D.setDate((7 - D.getDay()) % 7 + 1);
	return new Date(D.getFullYear(), D.getMonth(), D.getDate());
}
Date.prototype.firstSundayOfMonth = function() {
	return this.error() ? false : Date.firstSundayOfMonth(this.getMonth() + 1, this.getFullYear());
}
/*
获取某年最后一个星期日
按照最后一个星期日所在的周为本年的最后一周
*/
Date.lastSundayOfYear = function(year) {
	var b = Date.isYear(year);
	if (year && !b) return false;
	var D = new Date();
	D.setMonth(11);
	D.setDate(31);
	if (b) D.setYear(year);
	D.setDate(31 - D.getDay());
	return new Date(D.getFullYear(), D.getMonth(), D.getDate());
}
Date.prototype.lastSundayOfYear = function() {
	return this.error() ? false : Date.lastSundayOfYear(this.getFullYear());
}
/*
获取某月最后一个星期日
按照最后一个星期日所在的周为本月的最后一周
*/
Date.lastSundayOfMonth = function(month, year) {
	var bm = Date.isMonth(month),
		by = Date.isYear(year);
	if (year && !by || month && !bm) return false;
	var D = new Date();
	D.setDate(1);
	if (by) D.setYear(year);
	if (bm) D.setMonth(month - 1);
	var days = D.daysOfMonth();
	D.setDate(days);
	D.setDate(days - D.getDay());
	return new Date(D.getFullYear(), D.getMonth(), D.getDate());
}
Date.prototype.lastSundayOfMonth = function() {
	return this.error() ? false : Date.lastSundayOfMonth(this.getMonth() + 1, this.getFullYear());
}
//返回某年周数
Date.weeksOfYear = function(year) {
	if (!Date.isYear(year)) return false;
	var d1 = Date.firstSundayOfYear(year),
		d2 = Date.lastSundayOfYear(year);
	return (d2.getTime() - d1.getTime()) / 864e5 / 7 + 1;
}
Date.prototype.weeksOfYear = function() {
	return this.error() ? false : Date.weeksOfYear(this.getFullYear());
}
/*
根据指定的参数，计算一个日期，并返回，可以使用的参数有
year，年份4位年，没有则默认为本年
month，月份1-12，可以没有，亦无默认值
week，某一周
num，某一天或某一个星期几
weekday，星期数0-6，必须配合week或num参数
规则：
	year,num，返回year年的第num天
	year,month,num，返回year年month月的第num天
	year,num,weekday，返回year年第num个星期weekday，此项不受"本年第一个周日所在周为本年第一周"这个限制
	year,month,num,weekday，返回year年month月第num个星期weekday，此项不受"本月第一个周日所在周为本月第一周"这个限制
	year,week,weekday，返回year年第week周的星期weekday
	year,month,week,weekday，返回year年month月第week周的星期weekday
*/
Date.getDate = function(oOptions) {
	function isPosInt(n) {
		return n && /^[\+]?[\d]+$/.test(n.toString());
	}
	if (!oOptions) return false;
	var year = oOptions.year * 1,
		month = oOptions.month * 1,
		num = oOptions.num * 1,
		week = oOptions.week * 1,
		weekday = oOptions.weekday * 1;
	var isYear = Date.isYear(year),
		isMonth = Date.isMonth(month),
		isNum = isPosInt(num),
		isWeek = Date.isWeek(week),
		isWeekday = Date.isWeekday(weekday);
	if (!isYear) year = Date.year();
	if (isMonth && isWeek && isWeekday) //返回year年month月第week周的星期weekday，超出月份所包含的周则返回false
	{
		var d = Date.firstSundayOfMonth(month, year);
		var date = month == 12 ? Date.firstSundayOfYear(year + 1) : Date.firstSundayOfMonth(month + 1, year);
		d.setTime(d.getTime() + 864e5 * (7 * (week - 1) + weekday));
		return Date.differ(d, date) > 0 ? d : false;
	}
	if (isWeek && isWeekday) //返回year年第week周的星期weekday，超出年份所包含的周则返回false
	{
		var d = Date.firstSundayOfYear(year),
			date = Date.firstSundayOfYear(year + 1);
		d.setTime(d.getTime() + 864e5 * (7 * (week - 1) + weekday));
		return Date.differ(d, date) > 0 ? d : false;
	}
	if (isMonth && isNum && isWeekday) //返回year年month月第num个星期weekday，此项不受"本月第一个周日所在周为本月第一周"这个限制，超出本月返回false
	{
		var d = new Date(year, month - 1, 1),
			date = month == 11 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
		var wd = d.getDay();
		d.setTime(d.getTime() + ((weekday - wd + 7) % 7 + (num - 1) * 7) * 864e5);
		return Date.differ(d, date) > 0 ? d : false;
	}
	if (isNum && isWeekday) //返回year年第num个星期weekday，此项不受"本年第一个周日所在周为本年第一周"这个限制，超出本年返回false
	{
		var d = new Date(year, 0, 1),
			date = new Date(year + 1, 0, 1);
		var wd = d.getDay();
		d.setTime(d.getTime() + ((weekday - wd + 7) % 7 + (num - 1) * 7) * 864e5);
		return Date.differ(d, date) > 0 ? d : false;
	}
	if (isMonth && isNum) //返回year年month月的第num天，超出本月返回false
	{
		var d = new Date(year, month - 1, num),
			date = month == 11 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
		return Date.error(d) || Date.differ(d, date) > 0 ? d : false;
	}
	if (isNum) //返回year年的第num天，超出本年返回false
	{
		var d = new Date(year, 0, 1),
			date = new Date(year + 1, 0, 1);
		d.setTime(d.getTime() + (num - 1) * 864e5);
		return Date.differ(d, date) > 0 ? d : false;;
	}
	return false;
}
//返回当前日期是本年中的第几天
Date.prototype.atDayOfYear = function() {
	if (this.error()) return false;
	var Jan1 = new Date(this.getFullYear(), 0, 1),
		today = this.today();
	return (today.getTime() - Jan1.getTime()) / 864e5 + 1;
}
//返回当前日期在本年的第几周，如果日期所在周不在本年，则算上一年的周数
Date.prototype.atWeekOfYear = function() {
	if (this.error()) return false;
	var today = this.today();
	today.setTime(today.getTime() - today.getDay() * 864e5);
	var Sun = Date.firstSundayOfYear(today.getFullYear());
	return (today.getTime() - Sun.getTime()) / 864e5 / 7 + 1;
}
//返回当前日期在本月的第几周，如果日期所在周不在本月，则算上一月的周数
Date.prototype.atWeekOfMonth = function() {
	if (this.error()) return false;
	var today = this.today();
	today.setTime(today.getTime() - today.getDay() * 864e5);
	var Sun = Date.firstSundayOfMonth(today.getMonth() + 1, today.getFullYear());
	return (today.getTime() - Sun.getTime()) / 864e5 / 7 + 1;
}
//返回当前日期是本月的第几个星期几，数组，此项不受"本月第一个周日所在周为本月第一周"这个限制
Date.prototype.atWeekdayOfMonth = function() {
	if (this.error()) return false;
	var weekday = this.getDay(),
		First = new Date(this.getFullYear(), this.getMonth(), 1),
		wd = First.getDay(),
		today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
	First.setTime(First.getTime() + (weekday - wd + 7) % 7 * 864e5);
	return [(today.getTime() - First.getTime()) / 864e5 / 7 + 1, weekday];
}
//返回当前日期是本年的第几个星期几，数组，此项不受"本年第一个周日所在周为本年第一周"这个限制
Date.prototype.atWeekdayOfYear = function() {
	if (this.error()) return false;
	var weekday = this.getDay(),
		Jan1 = new Date(this.getFullYear(), 0, 1),
		wd = Jan1.getDay(),
		today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
	Jan1.setTime(Jan1.getTime() + (weekday - wd + 7) % 7 * 864e5);
	return [(today.getTime() - Jan1.getTime()) / 864e5 / 7 + 1, weekday];
}