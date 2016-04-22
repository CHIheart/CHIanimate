// JavaScript Document
//如果前边没有定义过rootPath，指定引用本文件的文件，相对于本文件所在目录的相对路径，则直接使用空，认为本文件所在目录，与引用本文件的文件，在同一个目录中
if(typeof(rootPath)=="undefined")rootPath="/77admin/";
document.write("<script src='"+ rootPath +"js/jquery.js'></script>");
document.write("<script src='"+ rootPath +"js/jquery.form.js'></script>");
document.write("<script src='"+ rootPath +"js/pattern.js'></script>");
document.write("<script src='"+ rootPath +"js/basic.js'></script>");
document.write("<script src='"+ rootPath +"incs/vars.js'></script>");//多语言变量文件头
//前五项必须包含
document.write("<script src='"+ rootPath +"js/f/actions.js'></script>");//异步处理信息的函数
document.write("<script src='"+ rootPath +"js/f/date.js'></script>");//多格式时间字符串
document.write("<script src='"+ rootPath +"js/f/dom.js'></script>");//表单组件检查与控制
document.write("<script src='"+ rootPath +"js/f/init.js'></script>");//某些特殊功能的DOM初始化
document.write("<script src='"+ rootPath +"js/e/correct.js'></script>");//页面纠正效果
document.write("<script src='"+ rootPath +"js/p/bg.js'></script>");//半透明背景
document.write("<script src='"+ rootPath +"js/p/alarm.js'></script>");//提示窗
/*
e为effect，里边的文件都是前台特效，需要用到时单独引用
	correct.js，图片纠正
	drawer.js，抽屉
	float.js，浮动
	magnifier.js，放大镜
	menu.js，左导航
	movie.js，可带数字的有界限分页播放
	page.js，无限循环分页播放
	ppt.js，淡入淡出播放
	scroll.js，无限循环滚动
	tabs.js，标签页

p为plugin，里边的文件基本上很少用到，只在特定位置单独引用，这些插件都需要bg.js
	bg.js，半透明背景
	icons.js，字体图标Font Awesome的选择窗
	colors.js，Metro配色方案的颜色选择窗
	viewer.js，本页大图浏览
	calendar.js，日期选择器，必须要date.js
	alarm.js，提示窗
下边的插件不需要bg.js
	falls.js，仿瀑布流效果
*/
