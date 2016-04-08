<?php
define("ON", false);
header('Content-Type: text/html; charset=utf-8');
include "process.php";

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



echo outputPage("index/index.html",$data);

