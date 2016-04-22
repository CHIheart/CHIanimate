// JavaScript Document
var BR='<br />';//回车，HTML转行
var NL='\r';//转行，普通文本转行
var str_free=/^[\w\W]*$/;//不限制
var str_int=/^[\+\-]?[\d]+$/;//十进制整数
var str_int_pos=/^[\+]?[0]*[1-9][\d]*$/;//正整数，+0不算
var str_int_neg=/^[\-][0]*[1-9][\d]*$/;//负整数，-0不算
var str_0=/^[+-]?[0]+$/;//零，多个0算是一个0
var str_int_nat=/^[\+]?[\d]+$/;//自然数
var str_int_odd=/^[\+\-]?[\d]*[13579]$/;//奇数
var str_int_evn=/^[\+\-]?[\d]*[24680]$/;//偶数
var str_int_fiv=/^[\+\-]?[\d]*[50]$/;//五的倍数
var str_int_bin=/^[01]+$/;//二进制整数
var str_int_oct=/^[0-8]+$/;//八进制整数
var str_int_hex=/^[a-f\d]+$/i;//十六进制整数

var str_float=/^[\+\-]?(([\d]+([\.][\d]+)?)|([\d]*[\.][\d]+))$/;//单精度浮点数（包含整数，与无整数的小数）
var str_double=/^[\+\-]?[\d]([\.][\d]+)?([e][\d]+)?$/i;//双精数度浮点数，有效数字一定在1到10的右半开区间上，所以不能出现.5的状况

var str_letter=/^[a-z]+$/i;//纯字母
var str_passport=/^[a-z][\w\-]{5,19}$/i;//6-20位帐号
var str_notEmpty=/^[\s\S]*[\S][\s\S]*$/;//非空
var str_empty=/^[\s]*$/;//空
var str_var=/^[a-z]([\w]*)$/i//变量名，使用字母开头，后边可以使用字母数字及下划线

var str_email=/^([a-z\d][\w\-]+)@[a-z\d][\w\-]*([\.][a-z\d][\w\-]*)+$/i;//邮箱地址
var str_qq=/^[1-9][\d]{5,}$/;//6位或以上的QQ号码
var str_postcode=/^[1-9][\d]{5}$/;//中国大陆邮编
var str_idcard=/^[1-9][0-9]{16}[0-9x]$/i;//18位身份证号码

var str_color=/^[\#]?([0-9a-f]{3}){1,2}$/i;//3或6位颜色值

var str_tel=/^(0[1-9][\d]{1,2})?[\-]?[1-9][\d]{6,7}$/;//国内固定电话
var str_400=/^400[\-]?(([0-9]{3}[\-]?[0-9]{4})|([0-9]{4}[\-]?[0-9]{3}))$/;//400热线
var str_mobile=/^([\+]?86[\-]?)?1[3458][0-9]{9}$/;//国内手机号码

var str_url=/^(http:\/\/)?[a-z0-9][\w\-]*([\.][a-z0-9][\w\-]*)+([\/][\S]*)?$/i;//http协议的网络地址
var str_folderpath=/^[\/]?[\w][\w\-]*([\/][\w][\w\-]*)*[\/]?$/;//相对文件夹路径，可以在目录名中使用减号，可以以斜线开始或结尾
var str_pagename=/[\w]*[.][\w]*$/i;//一个URL最末尾的文件名格式
var str_hostname=/(?=http:\/\/)([\w\-]+(\.[\w]+)*)(?=\/)/i;//一个处于http://与/之间的常规域名

var str_cnword=/[\u4E00-\u9FA5]/g;//（非纯）汉字的正则表达式

function isPos(n){return n && str_int_pos.test(n);}
function isNeg(n){return n && str_int_neg.test(n);}
function isFunction(n){return n instanceof Function;}
function isArray(n){return n instanceof Array;}
function isObject(n){return n instanceof Object;}
