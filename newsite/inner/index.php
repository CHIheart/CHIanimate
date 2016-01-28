<?php
define("ON", false);
define("PATH_FROM_ROOT",$_SERVER['DOCUMENT_ROOT'].'/inner/');
ON && header('Content-Type: text/html; charset=utf-8');
include "../inc.php";

$data = array(
	"header"=>array(
		"webtitle"=>"子目录同级引用",
		"navs"=>array(
			array(
				"href"=>"about.html",
				"alt"=>"关于我们-网站标题",
				"title"=>"关于我们",
				"others"=>'target="_blank"',
				"text"=>"关于我们"
			),
			array(
				"href"=>"pros.html",
				"alt"=>"产品中心-网站标题",
				"title"=>"产品中心",
				"others"=>'target="_blank"',
				"text"=>"产品中心",
				"navs"=>array(
					array(
						"href"=>"pros.html/1",
						"alt"=>"类型1-产品中心-网站标题",
						"title"=>"类型1-产品中心",
						"others"=>'target="_blank"',
						"text"=>"类型1"
					),
					array(
						"href"=>"pros.html/2",
						"alt"=>"类型2-产品中心-网站标题",
						"title"=>"类型2-产品中心",
						"others"=>'target="_blank"',
						"text"=>"类型2"
					)
				)
			)
		)
	),
	"something"=>"主要内容",
	"login"=>true,
	"login_action"=>"#login_url",
	"user"=>array(
		"name"=>"用户小明",
		"last_time"=>"上个礼拜"
	)
);

echo parseTemplate("index.html",$data);
echo PATH_FROM_ROOT.'../index.html';
echo realpath(PATH_FROM_ROOT.'../index.html');
echo '完成';

