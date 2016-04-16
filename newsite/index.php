<?php
header('Content-Type: text/html; charset=utf-8');
include "process.php";

$data = array(
	"title"=>"乐车仔商城首页",
	"description"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"keywords"=>"空调格 行车记录仪 汽车配件 汽车坐垫",
	"login"=>"false",
	"url_regist"=>"注册的地址",
	"user"=>"用户账号",
	"url_orders"=>"order/",
	"cart_href"=>"#购物车页面地址",
	"usermenu"=>array(
		array(
			"href"=>"ucenter/#1",
			"blank"=>"_blank",
			"name"=>"账号中心",
			"other"=>""
		),
		array(
			"href"=>"#2",
			"blank"=>"_blank",
			"name"=>"服务中心",
			"other"=>""
		),
		array(
			"href"=>"",
			"blank"=>"",
			"name"=>"退出登陆",
			"other"=>"ng-click=\"logout();\""
		),
	),
	"categories"=>array(
		array(
			"url"=>"#脚垫的地址",
			"name"=>"汽车脚垫",
			"alt"=>"用于SEO的优化字 of 脚垫",
			"subcates"=>array(
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#丝圈脚垫地址",
					"name"=>"丝圈脚垫",
					"alt"=>"alt of 丝圈脚垫",
					"img"=>"/srcs/images/pro.png"
				),
			)
		),
		array(
			"url"=>"#空调格的地址",
			"name"=>"空调格",
			"alt"=>"用于SEO的优化字 of 空调格",
			"subcates"=>array(
				array(
					"url"=>"#空调格地址",
					"name"=>"空调格",
					"alt"=>"alt of 空调格",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#空调格地址",
					"name"=>"空调格",
					"alt"=>"alt of 空调格",
					"img"=>"/srcs/images/pro.png"
				),
				array(
					"url"=>"#空调格地址",
					"name"=>"空调格",
					"alt"=>"alt of 空调格",
					"img"=>"/srcs/images/pro.png"
				),
			)
		),
	),
	"ppt"=>array(
		array(
			"url"=>"#1",
			"img"=>"http://www.new.com/index/ppt/ban1.png",
			"alt"=>"用于SEO的img的alt属性",
			"title"=>"图片1"
		),
		array(
			"url"=>"#2",
			"img"=>"http://www.new.com/index/ppt/ban2.png",
			"alt"=>"用于SEO的img的alt属性",
			"title"=>"图片2"
		),
	)
);



echo outputPage("index/index.html",$data);

