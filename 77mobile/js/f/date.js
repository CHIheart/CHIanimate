// JavaScript Document
var mspd/*milliseconds per day*/=24*60*60*1000;
function dateadd(ds,da,du)
{//在日期da上加上ds天，ds可正可负，du为时间单位，默认为d天，还可以是w周，m月，y年
	var da=da?new Date(da):new Date();
	if(!du) du='d';
	var t/*time*/;
	switch(du)
	{
		case 'd': t=da.getTime()+ds*mspd; break;
		case 'w': t=(da.getTime()+ds*mspd*7); break;
		case 'm':
			var y=Math.floor(ds/12) + da.getFullYear();
			var m=ds%12+12 + da.getMonth();
			da.setYear(y);
			da.setMonth(m);
			t=da.getTime();
			break;
		case 'y':
			da.setYear(da.getFullYear()+ds)
			t=da.getTime();
			break;
	}
	return new Date(t);
}
function datediff(d1,d2)
{//返回从d1到d2的天数差，d1小则返回负数
	return (new Date(d1)-new Date(d2))/mspd;
}
function weekinmonth(w,n,m,y)
{//返回日期，y年m月中第n周的星期w，超出当月返回false
	if(!m) m=month();
	if(!y) y=year();
	if(!n) n=1;
	var f=new Date(y,m-1,1);
	var fw=weekday(f);
	var ds=(7+w-fw)%7+(n-1)*7-(w<fw?7:0);
	var nf=dateadd(ds,f);
	return nf.getFullYear()==f.getFullYear() && nf.getMonth()==f.getMonth()?nf:false;
}
function weekinyear(w,n,y)
{//返回日期，y年中第n周的星期w，超出当年返回false
	if(!y) y=year();
	if(!n) n=1;
	var f=new Date(y,0,1);
	var fw=weekday(f);
	var ds=(7+w-fw)%7+(n-1)*7-(w<fw?7:0);
	var nf=dateadd(ds,f);
	return nf.getFullYear()==f.getFullYear()?nf:false;
}
function weekdayinmonth(w,n,m,y)
{//返回日期，y年m月中第n个星期w，m取1-12，n取1-5，w取0-6，超出本月返回false
	if(!m) m=month();
	if(!y) y=year();
	if(!n) n=1;
	var f=new Date(y,m-1,1);
	var fw=weekday(f);
	if(fw<=w)n--;
	var nf=dateadd(n*7,f);
	fw=weekday(nf);
	nf=dateadd(w-fw,nf);
	return nf.getFullYear()==f.getFullYear() && nf.getMonth()==f.getMonth()?nf:false;
}
function weekdayinyear(w,n,y)
{//返回日期，y年中第n个星期w，n取1-52，w取0-6
	if(!y) y=year();
	if(!n) n=1;
	var f=new Date(y,0,1);
	fw=weekday(f);
	if(fw<= w)n--;
	var nf=dateadd(n*7,f);
	fw=weekday(nf);
	nf=dateadd(w-fw,nf);
	return nf.getFullYear()==f.getFullYear()?nf:false;
}
function dayinyear(n,y)
{//返回日期，y年中的第n天
	if(!y) y=year();
	var f=new Date(y,0,1);
	return dateadd(n-1,f);
}
function weekdayofmonth(str)
{//本月的第几个星期几
	var wom=weekofmonth(str);
	var wd=weekday(str);
	var f=new Date(str); f.setDate(1);
	var fwd=weekday(f);
	return (fwd>wd?(wom-1):wom)+','+wd;
}
function weekdayofyear(str)
{//本年的第几个星期几
	var woy=weekofyear(str);
	var wd=weekday(str);
	var f=new Date(str); f.setMonth(0); f.setDate(1);
	var fwd=weekday(f);
	return (fwd>wd?(woy-1):woy)+','+wd;
}
function weekofmonth(str)
{//本月的第几周，1-6
	var d=str?new Date(str):new Date();
	var f=new Date(d); f.setDate(1);
	var dw=weekofyear(d);
	var fw=weekofyear(f);
	return dw-fw+1;
}
function weekofyear(str)
{//本年中的第几周1-53
	var f=str?new Date(str):new Date();
	f.setMonth(0); f.setDate(1);
	return Math.ceil((dayofyear(str) + f.getDay())/7);
}
function dayofyear(str)
{//本年中的第几天1-366
	var d=str?new Date(str):new Date();
	var f=new Date(d); f.setMonth(0); f.setDate(1);
	return Math.floor((d-f)/mspd+1);
}
//年，月，日，星期，时，分，秒
function year(str){var d=str?new Date(str):new Date();return d.getFullYear();}
function month(str){var d=str?new Date(str):new Date();return d.getMonth()+1;}//1-12
function day(str){var d=str?new Date(str):new Date();return d.getDate();}//1-31
function weekday(str){var d=str?new Date(str):new Date();return d.getDay();}//0-6
function hour(str){var d=str?new Date(str):new Date();return d.getHours();}
function minite(str){var d=str?new Date(str):new Date();return d.getMinutes();}
function second(str){var d=str?new Date(str):new Date();return d.getSeconds();}
function lastyear(str){return year(str)-1;}
function nextyear(str){return year(str)+1;}
function lastmonth(str){var m=month(str)-1; return m==0?12:m;}
function nextmonth(str){var m=month(str)+1; return m==13?1:m;}
function yesterday(str){return dateadd(str,-1);}
function tomorrow(str){return dateadd(str,1);}
function maxday(m,y)
{//获取某年某月最大的日数，m使用1-12
	if(!y)y=year();
	if(!m)m=month();
	m*=1;y*=1;
	switch(m)
	{
		case 1:case 3:case 5:case 7:case 8:case 10:case 12:return 31;
		case 4:case 6:case 9:case 11:return 30;
		case 2:return (y%400==0 || y%100!=0 && y%4==0)?29:28;
		default:alert("unknown "+m);
	}
}