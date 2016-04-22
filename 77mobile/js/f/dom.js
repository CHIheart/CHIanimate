// JavaScript Document

function val(id){return $("#"+id).val();}
function reach(id){return $("#"+id).focus();}
function get(id){return $("#"+id).get(0);}
function isEmpty(id){return str_empty.test(val(id));}
function isNum(id){var v=val(id);return str_int.test(v) || str_float.test(v) || str_double.test(v);}
function isLetter(id){return str_letter.test(val(id));}
function isPos(id){return str_int_pos.test(val(id));}
function isNeg(id){return str_int_neg.test(val(id));}
function isInt(id){return str_int.test(val(id));}
function isFloat(id){return str_float.test(val(id));}
function isEmail(id){return str_email.test(val(id));}
function isQQ(id){return str_qq.test(val(id));}
function isTel(id){return str_tel.test(val(id));}
function isMobile(id){return str_mobile.test(val(id));}
function isPSP(id){return str_passport.test(val(id));}
/*
通用的自定义正则表达式的测试函数
value，被测试的值，可以为空
patName，使用的正则表达式名称，可以是str或date开头的名字
prefix，前缀，默认无，可以是str或date或time或date_time
*/
function test(value,patName,prefix)
{
	if(prefix)
	{
		var l=prefix.length;
		if(left(patName,l)!=prefix) patName=prefix+"_"+patName;
	}
	var pattern=eval(patName);
	if(pattern=="undefined"){CHIalarm.error(patName+' '+_words('not,dfn'));return false;}
	return pattern.test(value);
}
//整套的正则验证动作
function patternCheck(id,str,pattern)
{
	if(!pattern.test(val(id))){CHIalarm.error(str+" "+_words('pattern,error'));reach(id);return false;}
	return true;
}
//整套的验证空值动作
function emptyCheck(id,str)
{
	if(!str_notEmpty.test(val(id))){CHIalarm.error(str+" "+_words('cant,be,empty'));reach(id);return false;}
	return true;
}
//整套的验证数字值动作
function intCheck(id,str)
{
	if(!str_int_nat.test(val(id))){get(id).value=0;CHIalarm.error(str+" "+_words('must,be,nature'));reach(id);return false;}
	return true;
}

//检查一组IDS的checkbox是否有被选的，无一被选返回false
function checkIDS(n)
{
	if(!n)n="ids[]";
	var ts=document.getElementsByName(n);
	for(var i=0;i<ts.length;i++) if(ts[i].checked)return true;
	return false;
}
//正反全选动作，如果没有bool，则反选
function checkAll(n,bool)
{
	if(!n)n="ids[]";
	var ts=document.getElementsByName(n);
	for(var i=0;i<ts.length;i++)
	{
		if(bool==undefined)ts[i].checked=!(ts[i].checked);
		else ts[i].checked=bool;
	}
}
//返回单选框的值
function radio(n)
{
	var ts=document.getElementsByName(n);
	for(var i=0;i<ts.length;i++)
	{
		if(ts[i].checked)return ts[i].value;
	}
	return undefined;
}
//返回同名输入框的值，如果是复选框，则只返回被勾选的值，ifStr默认为true，返回字符串，否则返回数组
function vals(n,ifStr,sep)
{
	var arr=Array();
	if(ifStr==undefined)ifStr=true;
	if(sep==undefined)sep=',';
	var ts=document.getElementsByName(n);
	for(var i=0;i<ts.length;i++)
	{
		if(ts[i].type!='checkbox' || ts[i].checked) arr.push(ts[i].value);
	}
	return ifStr?(arr.join(sep)):arr;
}
//检查每个同名项目是否都符合某一项规则，返回第一个不符合规则的索引，如果全符合返回-1
function checks(n,pattern)
{
	if(!n || !pattern)return false;
	var ts=document.getElementsByName(n);
	for(var i=0;i<ts.length;i++)
	{
		if(!pattern.test(ts[i].value))return i;
	}
	return -1;
}