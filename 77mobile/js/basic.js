//前后台通用的函数
//判断IE版本
function isIE6(){return isIEX(6);}
function isIE7(){return isIEX(7);}
function isIE8(){return isIEX(8);}
function isIEX(x){return navigator.appVersion.indexOf("MSIE "+x+".0")>0;}
function isLow(){return isIE6() || isIE7() || isIE8();}
//低端浏览器，没有Array.indexOf()函数
if(!Array.prototype.indexOf)
Array.prototype.indexOf=function(ele){
	for(var n=0; n<this.length; n++)
	{
		if(ele===this[n]) return n;
	}
	return -1;
}
//JQ对象的in判断
$.fn.IN=function(JQobj){
	return $(this).closest(JQobj).size()>0;
}
////返回表示DOM的路径串
//function DOMpath(DOM)
//{
//	function getStr(DOM)
//	{
//		return DOM.tagName + (DOM.id?  ('#'+DOM.id) : (DOM.className? ('.'+DOM.className):''))
//	}
//	var path=getStr(DOM);
//	while(DOM.parentNode!=document.body)
//	{
//		DOM=DOM.parentNode;
//		path=getStr(DOM)  + ' \n-> '+ path;
//	}
//	return path;
//}
////线性执行各函数
//function CHIexecute(arr)
//{
//	if(!arr.length)return;
//	var f=arr.shift();
//	//alert(f);
//	if(arr.length)f(function(){CHIexecute(arr)});
//	else if(f) f();
//}
//显示对象
function WRITE(obj,NL)
{
	var str='';
	if(!NL) NL='<br>'
	if(typeof obj == 'object')
	for(var n in obj)
	{
		str+="obj."+n+"="+ obj[n] + NL;
	}
	else str=obj;
	return str;
}
function ALERT(obj){alert(WRITE(obj,'\n'));}
//将textarea中的\r转换成<br />
function nl2br(str){return replaceAll(str,"\u000a","<br />");}
function fresh(){location.reload();}
function jump(p,t)//跳转至某页，如果有分页隐藏域，则带上分页参数
{
	if(!t)t='_self';
	if(!p)p=0;
	switch(p)
	{
		case -1:	history.go(-1);return;
		case 1:		p=location.href;break;
		case 0:
		case '':	p='index.php';break;
		default:;
	}
	window.open(p,t);
}
/*
重构URL查询串函数，因为JS上不涉及到优化问题，所以不写RebuildURL了
newVarObj，需要加入或更新的参数对象，使用键值对的方式
egnoreVarObj，需要删除的参数数组
*/
function RebuildGet(newVarObj,egnoreVarArr)
{
	var newqs=new Object();
	var oldqs=window.location.search;
	if(oldqs[0] && oldqs[0]=='?')oldqs=oldqs.substr(1);
	oldqs=oldqs.split("&");
	for(var i=0;i<oldqs.length;i++)//整理旧参数
	{
		if(!oldqs[i][0])continue;
		oldqs[i]=oldqs[i].split("=");
		newqs[oldqs[i][0]]=oldqs[i][1];
	}
	if(typeof(newVarObj)=="array" || typeof(newVarObj)=="object")
	for(var key in newVarObj) newqs[key]=newVarObj[key];//加入新参数
	if(typeof(egnoreVarArr)=="array" || typeof(egnoreVarArr)=="object")
	for(var i=0;i<egnoreVarArr.length;i++)//删除被忽略参数
		if(newqs.hasOwnProperty(egnoreVarArr[i]))
			delete newqs[egnoreVarArr[i]];
	var newstr=Array();
	for(key in newqs) newstr.push(key+"="+newqs[key]);//重新整理查询串
	return '?'+newstr.join("&");
}
//分页或章节使用的跳转函数
function PsJumping(name,sn)
{
	if(!intCheck(name+sn,'PAGE_VAR'))return false;
	var obj=new Object();
	obj[name]=val(name+sn);
	var qs=RebuildGet(obj);
	obj=null;
	window.open(qs,'_self');return false;
}
//组织多语言提示字符
function _words(ws)
{
	var str=Array();
	var vv;
	if(typeof(ws)!="array") ws=ws.split(',');
	for(k in ws)
	{
		name=ws[k];
		vn="CHI"+name;
		eval("vv=typeof("+vn+");");
		if(vv=="undefined") vv="?"+ name +"?";
		else eval("vv="+vn+";");
		str.push(vv);
	}
	return str.join(' ');
}
function SetHome(tar)//可以放在热点上的"设为首页"代码，调用时的参数为this
{
	tar.style.behavior='url(#default#homepage)';
	tar.setHomePage(location.href); 
}
function AddFav()//可以放在热点上的"加入收藏"代码
{
	if (document.all)
	{
		window.external.addFavorite(location.href,document.title);
	}
	else if (window.sidebar)
	{
		window.sidebar.addPanel(document.title,location.href,"");
	}
	else
	{
		alert("加入收藏失败，请手工添加。");
	}
}
