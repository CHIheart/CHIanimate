<?php
define("ON", false);
ON && header('Content-Type: text/html; charset=utf-8');
include "inc.php";

$data = array(
	"title"=>"乐车仔商城首页",
	"description"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"keywords"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"login"=>false,
	"user"=>"用户账号",
	"url_orders"=>"#我的订单列表页面",
	"cart_href"=>"#购物车页面地址",
	"usermenu"=>array(
		array(
			"href"=>"#1",
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


