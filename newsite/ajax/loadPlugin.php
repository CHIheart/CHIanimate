<?php
include "../process.php";

$plugin=$_POST["plugin"];
if($plugin)
{
	echo loadPlugin($plugin);
}
else{
	var_dump($_POST);
	var_dump($_GET);
	var_dump($_REQUEST);
}