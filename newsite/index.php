<?php
define("ON", false);
header('Content-Type: text/html; charset=utf-8');
include "inc.php";

$data = array(
	"title"=>"乐车仔商城首页",
	"description"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"keywords"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"login"=>true,
	"url_regist"=>"注册的地址",
	"user"=>"用户账号",
	"url_orders"=>"order/",
	"cart_href"=>"#购物车页面地址",
	"usermenu"=>array(
		array(
			"href"=>"ucenter/#1",
			"blank"=>"_blank",
			"name"=>"账号中心"
		),
		array(
			"href"=>"#2",
			"blank"=>"_blank",
			"name"=>"服务中心"
		),
		array(
			"href"=>"#3",
			"blank"=>"",
			"name"=>"退出登陆"
		),
	)
);

echo parseTemplate("index/index.html",$data);

$reg="/(?<=[\w])\/(?<=[\w\W])/i";
$s1="/incs/header/index/index.js";
$a1=preg_split($reg, $s1);
$s2="/incs/header/usermenu/usermenu.js";
$a2=preg_split($reg, $s2);
$s3="/incs/header/topcart/topcart.js";
$a3=preg_split($reg, $s3);

$arr=array($s1,$s2,$s3);	

/*
暂定的文件打包合并规则
强写缓存文件时，会将一个模板中引用的所有CSS打包，所有JS打包
当多个模块共存时，最大限度地将目录统一化，然后只留文件基本名，用下划线相连，再缀以文件类型
例1：首页页头，会引用
	/incs/header/index/index.js(css)
	/incs/header/usermenu/usermenu.js(css)
	/incs/header/topcart/topcart.js(css)
	最后会合并成
	/incs/header/index_usermenu_topcart.js(css)
例2：首页页体，会引用
	/index/index.js(css)
	/index/ppt/ppt.js(css)
	/index/hots/hots.js(css)
	......
	最后会合并成
	/index/index_ppt_hots....js(css)
*/
function groupPaths($aPaths)
{
	$regSlash="/(?<=[\w])\/(?<=[\w\W])/i";
	foreach ($aPaths as $key => $value) {
		echo $key;
		$arr=preg_split($regSlash, $value);
		$len=count($arr);
		if($len>2)
		{
			$last1=$arr[$len-1];
			$last2=$arr[$len-2];
			$reg="/{$last2}\.(js|css)/i";
			echo $reg.PHP_EOL.'<br>';
			if(preg_match($reg, $last1))
				array_pop($arr);
		}
		$aPaths[$key]=$arr;
	}
	echo '<pre>';
	var_dump($aPaths);
	echo '</pre>';
	return '';
}

var_dump(groupPaths($arr));