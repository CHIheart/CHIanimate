<?php
include "../process.php";

$plugin=$_POST["plugin"];
if($plugin)
{
	echo loadPlugin($plugin);
}