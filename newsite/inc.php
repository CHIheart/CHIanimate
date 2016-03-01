<?php
/*
解析嵌套文件格式
<!--include src="footer.html" repeat="2" variable="$aData" condition="count($aData)"-->
其中的参数
src，必选，嵌套文件路径
condition，可选，默认为无，即无条件执行，还可以为可计算的表达式
variable，可选，默认为$aData，即函数的第二参数本身，还可以为可计算的表达式
repeat，可选，默认为1，只引入1次，-1是引入N次，直到将变量引用完为止
*/
define("STATIC_RESOURCE_URI",'http://'.$_SERVER['HTTP_HOST'].'/');
function parseTemplate($sFilepath,$aData,$sCurPath='')
{
	$sFileCompletePath=cal_url($sFilepath);
	$sFileContent=file_get_contents(STATIC_RESOURCE_URI.$sFileCompletePath);
	if(!$sFileContent)
	{
		echo "File does not exist: {$sFilepath}=>{$sFileCompletePath}<br>";
		return '';
	}
	if(ON)
	{
		echo "<strong>Parse template ".$sFileCompletePath." using data </strong>";
		var_dump($aData);
		echo "<br>";
	}
	//遍历所有include标志，来读取子文件嵌套
	$regIncludes='/<!--[\s]*include[\s\S]+?-->/i';
	preg_match_all($regIncludes, $sFileContent, $matches);
	$matches=$matches[0];
	if(count($matches))
	{
		$all='="([\s\S]+?(?<!\\\\))"';
		foreach($matches as $value)
		{
			//读取文件路径 
			$regSrc='/src="((?:\.{1,2}\/)*(?:[\w\d_]+\/)*[\w\d_\-]+(?:\.[\w\d_\-]+)+)"/i';
			preg_match_all($regSrc, $value, $matches);
			if(!count($matches[1]))
			{
				echo 'Signal "include" does not have the attribute "src": '.htmlentities($value).'<br>';
				continue;
			}
			//资源路径基本上都使用与当前文件相对的路径
			$srcCur=cal_url($sFileCompletePath,$matches[1][0]);
			//读取条件表达式
			$regCondition='/condition'.$all.'/';
			preg_match_all($regCondition, $value, $matches);
			if(count($matches[1])){
				try{
					$con=$matches[1][0];
					$result=eval(clear($con));
					if(!$result){
						$sFileContent=str_replace($value, '', $sFileContent);
						continue;
					}
				}catch(Exception $e){
					echo 'Message: ' .$e->getMessage(). '<br>';
					echo "Exception occurs when excuting {$con}: <br>";
				}
			}
			//读取循环表达式
			$regRepeat='/repeat'.$all.'/i';
			/*
			0时不循环，只用$aData来填充内容
			1时指循环1次，其实也只是显示1次包含文件内容，但是使用$aData（必须是自然数组）的子元素来循环
			>1时类推
			*/
			$repeats=0;//默认不循环
			preg_match_all($regRepeat, $value, $matches);
			if(count($matches[1])){
				try{
					$con=$matches[1][0];
					$repeats=eval(clear($con));
				}catch(Exception $e){
					echo 'Message: ' .$e->getMessage(). '<br>';
					echo "Exception occurs when excuting {$con}: <br>";
				}
			}
			//读取变量表达式
			$regVariable='/variable'.$all.'/i';
			$aCurData=$aData;
			preg_match_all($regVariable, $value, $matches);
			if(count($matches[1])){
				try{
					$con=$matches[1][0];
					$aCurData=eval(clear($con));
				}catch(Exception $e){
					echo 'Message: ' .$e->getMessage(). '<br>';
					echo "Exception occurs when excuting {$con}: <br>";
				}
			}
			//读取本文件路径（以方便其内部的相对路径使用此路径作为前缀）
			$regFileName='/[\w\d\-\_]+.html/i';
			preg_match_all($regFileName, $sFilepath, $matches);
			$sFileName=$matches[0][0];
			$sNextCurPath=$sCurPath.str_replace($sFileName, '', $sFilepath);
			// echo $sFilepath.'<br>'.$sFileName.'<br>'.$sCurPath.'<br>';
			//开始循环
			switch($repeats)
			{
				case 0://不循环，直接用数据来填充
					$parsedString=parseTemplate($srcCur,$aCurData,$sNextCurPath);
					break;
				case -1://无限循环，使用穿透条件
					$repeats=count($aCurData) +1;
				default://有限循环
					if(is_assoc($aCurData))
					{
						echo 'You can only use natural array to loop!!!<br>';
						var_dump($aCurData);
						continue;
					}
					$repeats=min($repeats,count($aCurData));
					for($n=0;$n<$repeats;$n++)
					{
						$parsedString[]=parseTemplate($srcCur,$aCurData[$n],$sNextCurPath);
					}
					$parsedString=implode('', $parsedString);
			}
			$sFileContent=str_replace($value, $parsedString, $sFileContent);
		}
	}
	//使用变量解析文件，并填充内容
	$regVars='/\{\$([\w\d_][\w\d_]*)\}*/i';
	preg_match_all($regVars, $sFileContent, $matches);
	if(ON)
	{
		echo "<i>Parsing {$sFilepath} normal variables including </i>";
		var_dump($matches);
		echo "<br>";
	}
	if(count($matches)==2)
	{
		$aVars=$matches[0];
		$aKeys=$matches[1];
		if(count($aVars)!=count($aKeys))
		{
			echo '<del>The Variables Array has different length from the Keys Array!!</del><br>';
			return '';
		}
		foreach ($aKeys as $key => $value) {
			$sFileContent=str_replace($aVars[$key], $aData[$value], $sFileContent);
		}
	}

	//整理页面中的链接/资源路径，可能是CSS/JS/A/媒体等
	$links='/(href|src)\=\"([\w\d\.\-\/]+)\"/i';
	preg_match_all($links, $sFileContent, $matches);
	foreach ($matches[0] as $key => $value) {
		$url=$matches[1][$key].'="'.cal_url($sFileCompletePath,$matches[2][$key]).'"';
		$sFileContent=str_replace($value, $url, $sFileContent);
	}

	//如果是第一层，即最终输出页面，则整理css及js位置，放到头/体闭合标签之前
	if($sCurPath==='')
	{
		//读取CSS放到</head>标签之前
		$regCss='/\<link rel\=\"stylesheet\" href\=\"[\w\d\.\-\/]+\.css\"\>/i';
		preg_match_all($regCss, $sFileContent, $matches);
		$matches=$matches[0];
		foreach ($matches as $value) {
			$sFileContent=str_replace($value,'',$sFileContent);
			$sFileContent=str_replace('</head>', $value.PHP_EOL.'</head>', $sFileContent);
		}
		//读取JS放到</body>标签之前
		$regJs='/\<script src\=\"[\w\d\.\-\/]+\.js\"\>\<\/script\>/i';
		preg_match_all($regJs, $sFileContent, $matches);
		$matches=$matches[0];
		foreach ($matches as $value) {
			$sFileContent=str_replace($value,'',$sFileContent);
			$sFileContent=str_replace('</body>', $value.PHP_EOL.'</body>', $sFileContent);
		}
	}
	return $sFileContent;
}
//清除反斜线
function clear($str)
{
	return str_replace('\\','',"return {$str};");
}
//判断数组是否为关联数组
function is_assoc($arr) {
    return is_array($arr) && array_keys($arr) != range(0, count($arr) - 1);  
}
//计算成干净的URL，站点跟路径的话，直接返回原路径，如果是相对路径的话，则需要计算
function cal_url($baseUrl,$relUrl=''){
	//因为最主要是要计算后边的资源路径，所以先判断资源路径，再判断基本路径（引用资源的这个html文件）
	if(strlen($relUrl)>0)
	{
		if(!need($relUrl[0])) return $relUrl;
	}
	elseif(!need($baseUrl[0])) return $baseUrl;
	// if(strlen($relUrl)>0 && $relUrl[0]=='/') return $relUrl;
	// if(strlen($baseUrl)>0 && $baseUrl[0]=='/') return $baseUrl;
	$regFileName='/[\w\d\-\_]+\.(html|js|css)/i';
	preg_match_all($regFileName, $baseUrl, $matches);
	$matches=$matches[0];
	$basePath=count($matches) && $relUrl!=='' ? str_replace($matches[0], '', $baseUrl) : $baseUrl;
	$absUrl=$basePath.$relUrl;
	$absUrl=str_replace('//', '/', $absUrl);
	$urlarr=explode('/', $absUrl);
	foreach ($urlarr as $key => $value) {
		switch($value){
			case '..'://删除当前及前一个
				unset($urlarr[$key-1]);
			case '.'://删除当前这个
				unset($urlarr[$key]);
		}
	}
	$url=implode('/', $urlarr);
	if(need($url)) $url='/'.$url;
	return $url;
}
//不需要计算的路径，以http/https或/开头的路径名
function need($url){
	return !preg_match('/^(http[s]?|\/)/i', $url);
}

/**
 * 调用插件，将插件的HTML与JS/CSS写在一起，再返回来
 */

function load_plugin($plugin_src){
	
}