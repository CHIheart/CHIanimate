<?php
include "../inc.php";

$plugin=$_GET["plugin"];
if($plugin)
{
	echo loadPlugin($plugin);
}