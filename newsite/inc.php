<?php
include "jsmin.php";
/*
解析嵌套文件格式
<!--include src="footer.html" repeat="2" variable="$aData" condition="count($aData)"-->
其中的参数
src，必选，嵌套文件路径
condition，可选，默认为无，即无条件执行，还可以为可计算的表达式
variable，可选，默认为$aData，即函数的第二参数本身，还可以为可计算的表达式
repeat，可选，默认为1，只引入1次，-1是引入N次，直到将变量引用完为止
*/
define("STATIC_RESOURCE_URI",'http://'.$_SERVER['HTTP_HOST']);
define("WEB_ROOT_AT_DISK",$_SERVER['DOCUMENT_ROOT']);
//最后一步解析模板
function parseTemplate($sFilepath,$aData)
{
	$sFileContent=traverseTemplate($sFilepath,$aData);
	//这两段虽然可以，但先不要缩，有可能规则会改变
	//如果是第一层，即最终输出页面，则整理css及js位置，放到头/体闭合标签之前
	//读取CSS放到</head>标签之前
	$regCss='/\<link rel\=\"stylesheet\" href\=\"([\w\d\.\-\/\?\#]+\.css)\"\>/i';
	preg_match_all($regCss, $sFileContent, $matches);
	//如果被包含的碎片含有重复的CSS/JS资源的话，去重复
	$matches[0]=array_unique($matches[0]);
	$matches[1]=array_unique($matches[1]);
	foreach ($matches[0] as $key => $value) {
		//这句会把重复的资源都清掉
		$sFileContent=str_replace($value,'',$sFileContent);
		$src=$matches[1][$key];
		$value=str_replace($src, STATIC_RESOURCE_URI.$src, $value);
		//但这句只会插入一次整理过路径的资源
		$sFileContent=str_replace('</head>', $value.PHP_EOL.'</head>', $sFileContent);
	}
	//读取JS放到</body>标签之前
	$regJs='/\<script src\=\"([\w\d\.\-\/\?\#]+\.js)\"\>\<\/script\>/i';
	preg_match_all($regJs, $sFileContent, $matches);
	$matches[0]=array_unique($matches[0]);
	$matches[1]=array_unique($matches[1]);
	foreach ($matches[0] as $key => $value) {
		$sFileContent=str_replace($value,'',$sFileContent);
		$src=$matches[1][$key];
		$value=str_replace($src, STATIC_RESOURCE_URI.$src, $value);
		$sFileContent=str_replace('</body>', $value.PHP_EOL.'</body>', $sFileContent);
	}
	return $sFileContent;
}
//递归读取模板并写入动态数据
function traverseTemplate($sFilepath,$aData)
{
	$sFileCompletePath=calculateUrl($sFilepath);
	$sFileContent=getContents($sFileCompletePath);
	if(!$sFileContent)
	{
		echo "File does not exist: {$sFilepath}=>{$sFileCompletePath}<br>";
		return '';
	}
	//遍历所有include标志，来读取子文件嵌套
	$regIncludes='/<!-- include[\s\S]+? -->/i';
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
			$srcCur=calculateUrl($sFileCompletePath,$matches[1][0]);
			//读取条件表达式
			$regCondition='/condition'.$all.'/';
			preg_match_all($regCondition, $value, $matches);
			if(count($matches[1])){
				try{
					$con=$matches[1][0];
					$result=eval(clearBackslash($con));
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
					$repeats=eval(clearBackslash($con));
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
					$aCurData=eval(clearBackslash($con));
				}catch(Exception $e){
					echo 'Message: ' .$e->getMessage(). '<br>';
					echo "Exception occurs when excuting {$con}: <br>";
				}
			}
			//读取本文件路径（以方便其内部的相对路径使用此路径作为前缀）
			$regFileName='/[\w\d\-\_]+.html/i';
			preg_match_all($regFileName, $sFilepath, $matches);
			$sFileName=$matches[0][0];
			// echo $sFilepath.'<br>'.$sFileName.'<br>'.$sCurPath.'<br>';
			//开始循环
			switch($repeats)
			{
				case 0://不循环，直接用数据来填充
					$parsedString=traverseTemplate($srcCur,$aCurData);
					break;
				case -1://无限循环，使用穿透条件
					$repeats=count($aCurData) +1;
				default://有限循环
					if(isAssocArray($aCurData))
					{
						echo 'You can only use natural array to loop!!!<br>';
						var_dump($aCurData);
						continue;
					}
					$repeats=min($repeats,count($aCurData));
					for($n=0;$n<$repeats;$n++)
					{
						//将索引号写入数据中，以便进行有索引区分的判断
						$aCurData[$n]['index']=$n;
						$parsedString[]=traverseTemplate($srcCur,$aCurData[$n]);
					}
					$parsedString=implode('', $parsedString);
			}
			$sFileContent=str_replace($value, $parsedString, $sFileContent);
		}
	}
	//使用变量解析文件，并填充内容
	$regVars='/\{\$([\w\d_][\w\d_]*)\}*/i';
	preg_match_all($regVars, $sFileContent, $matches);
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
			//此处当变量不存在时，选择不报错，直接忽略（后边的模板打包时要用到）
			if(!isset($aData[$value])) continue;
			//PHP没办法直接输出true跟false，只能这么写
			$goalValue=$aData[$value];
			$goalValue=$goalValue===true ? 'true' : ($goalValue===false ? 'false' : $goalValue);
			$sFileContent=str_replace($aVars[$key], $goalValue, $sFileContent);
		}
	}

	//整理页面中的资源路径，可能是CSS/JS/img/媒体等
	$regResource='/(\<(?:link|script)[^\>]+)((?:href|src)\=\")([\w\d\.\-\/\?\#]+)(\"[^\>]*[\/]?\>)/i';
	preg_match_all($regResource, $sFileContent, $matches);
	foreach ($matches[0] as $key => $value) {
		$url=$matches[1][$key].$matches[2][$key].calculateUrl($sFileCompletePath,$matches[3][$key]).$matches[4][$key];
		$sFileContent=str_replace($value, $url, $sFileContent);
	}
	//a标签的链接不处理，以后台给出的数据为准

	//查看文件是否需要强写缓存文件，如果是cache目录中的文件不会带有此标志，因为在生成文件时已经被删除
	$sign='<!-- SIGN FOR CACHE -->';
	if(strpos($sFileContent, $sign)!==false)
	{
		//先正则CSS，生成合并文件及新文件名
		$regCss='/\<link rel\=\"stylesheet\" href\=\"([\w\d\.\-\/\?\#]+\.css)\"\>/i';
		$aFileNames=array();
		$aFileCnts=array();
		preg_match_all($regCss, $sFileContent, $matches);
		foreach ($matches[1] as $key => $value) {
			$aFileNames[]=str_replace(".css", '', $value);
			$aCurCnt=getContents($value);
			//读取内容后，要把资源路径计算出来，不然统一移动的时候，会不知道哪个资源是相对于哪个样式表文件的
			$regUrl='/url\(\"?([^\(\)\'\"]+)\)/i';
			preg_match_all($regUrl, $aCurCnt, $matches2);
			foreach ($matches2[1] as $src) {
				//字体文件会自带查询串，这是不重要的，可以抹掉它们，再加入当前的MD5戳
				$newsrc=preg_replace('/\?[^\'\"\)]+/i', '', $src);
				//计算资源相对于当前CSS文件的绝对路径
				$newsrc=STATIC_RESOURCE_URI.calculateUrl($value,$newsrc);
				//给资源加上MD5戳
				$newsrc.='?'.substr(md5_file($newsrc),0,6);
				//将CSS代码中的这个资源替换成绝对且带有MD5戳的地址
				$aCurCnt=str_replace($src, $newsrc, $aCurCnt);
			}
			$aFileCnts[]=$aCurCnt;
		}
		//新文件名，是所有包的基本名用下划线连接之后，再加.css
		$sPkgName='/cache' .implode('_', $aFileNames) . '.css';
		$sPkgName=STATIC_RESOURCE_URI.$sPkgName;
		$sCssCnt=implode('', $aFileCnts);
		echo "<h1>写资源{$sPkgName}</h1>";
		// echo "<blockquote>". htmlspecialchars($sCssCnt) ."</blockquote>";
		
		//然后正则JS，生成合并文件及新文件名
		$regJs='/\<script src\=\"([\w\d\.\-\/]+\.js)\"\>\<\/script\>/i';
		$aFileNames=array();
		$aFileCnts=array();
		preg_match_all($regJs, $sFileContent, $matches);
		foreach ($matches[1] as $key => $value) {
			$aFileNames[]=str_replace(".js", '', $value);
			$aFileCnts[]=getContents($value);
		}
		$sPkgName='/cache' .implode('_', $aFileNames) . '.js';
		$sPkgName=STATIC_RESOURCE_URI.$sPkgName;
		echo "<h1>写资源{$sPkgName}</h1>";
		$sJsMinCnt=implode('', $aFileCnts);
		if(strpos($sPkgName, '/lib')===false) $sJsMinCnt=JSMin::minify($sJsMinCnt);
		// echo "<blockquote>". ($sJsMinCnt) ."</blockquote>";

		//清除强缓存标志
		$sFileContent=str_replace($sign, '', $sFileContent);
		$cacheSrc= STATIC_RESOURCE_URI."/cache".$sFileCompletePath;
		echo "<h1>最后生成{$cacheSrc}</h1>";
	}
	return $sFileContent;
}
//以站点根目录为基准，写一个文件，如果非以/开头会被补上/
function writeFile($absUrl,$cnt){
	if($absUrl[0]!='/') $absUrl='/'.$absUrl;
	$file=@fopen(WEB_ROOT_AT_DISK.$absUrl,'a');
	if(!$file){
		$arr=explode('/', $absUrl);
		$path=WEB_ROOT_AT_DISK;
		for($n=0;$n<count($arr)-1;$n++)
		{
			$path.='/'.$arr[$n];
			if(!is_dir($path)) @mkdir($path);
		}
		$file=@fopen(WEB_ROOT_AT_DISK.$absUrl,'a');
	}
	@file_put_contents(WEB_ROOT_AT_DISK.$absUrl, $cnt);
	return $cnt;
}
//清除反斜线
function clearBackslash($str)
{
	return str_replace('\\','',"return {$str};");
}
//判断数组是否为关联数组
function isAssocArray($arr) {
    return is_array($arr) && array_keys($arr) != range(0, count($arr) - 1);  
}
//计算成干净的URL，站点跟路径的话，直接返回原路径，如果是相对路径的话，则需要计算
//最后返回的URL一定是基于站点根路径的，即以/开头
function calculateUrl($baseUrl,$relUrl=''){
	//因为最主要是要计算后边的资源路径，所以先判断资源路径，再判断基本路径（引用资源的这个html文件）
	$bool=strlen($relUrl)>0;
	if($bool && !needCalculate($relUrl[0])) return $relUrl;
	elseif(!$bool && !needCalculate($baseUrl[0])) return $baseUrl;
	$regFileName='/[\w\d\-\_]+\.(html|js|css)/i';
	preg_match_all($regFileName, $baseUrl, $matches);
	$matches=$matches[0];
	$basePath=count($matches) && $relUrl!=='' ? str_replace($matches[0], '', $baseUrl) : $baseUrl;
	$absUrl=$basePath.$relUrl;
	$absUrl=str_replace('//', '/', $absUrl);
	$urlarr=explode('/', $absUrl);
	$newarr=array();
	foreach ($urlarr as $value) {
		switch($value){
			case '..'://删除当前及前一个
				array_pop($newarr);
				break;
			case '.'://删除当前这个
				break;
			default:
				$newarr[]=$value;
		}
	}
	$url=implode('/', $newarr);
	if(needCalculate($url)) $url='/'.$url;
	return $url;
}
//不需要计算的路径，以http/https或/开头的路径名
function needCalculate($url){
	return !preg_match('/^(http[s]?|\/)/i', $url);
}
//加上静态资源标识后，获取文件内容，优先获取生成的静态文件
function getContents($sFile){
	foreach (array('/cache','') as $value) {
		$url=STATIC_RESOURCE_URI.$value.$sFile;
		$content=@file_get_contents($url);
		if($content) return $content;
	}
	return false;
	// $url=STATIC_RESOURCE_URI.'/cache'.$sFile;
	// $content=@file_get_contents($url);
	// if(!$content)
	// {
	// 	$url=STATIC_RESOURCE_URI.$sFile;
	// 	$content=@file_get_contents($url);
	// }
	// return $content;
}

/**
 * 调用插件，将插件的HTML与JS/CSS写在一起，再返回来
 * 参数直接使用插件名，目前的插件规则是完全独立，无依赖
 */
function loadPlugin($plugin){
	$sFileCompletePath="/incs/{$plugin}/{$plugin}.html";
	$sFileContent=getContents($sFileCompletePath);
	if(!$sFileContent)
	{
		echo "File does not exist: {$sFilepath}=>{$sFileCompletePath}<br>";
		return '';
	}
	//读取CSS放到<style></style>标签之内
	$regCss='/\<link rel\=\"stylesheet\" href\=\"([\w\d\.\-\/]+\.css)\"\>/i';
	preg_match_all($regCss, $sFileContent, $matches);
	foreach ($matches[0] as $key => $value) {
		$srcPath=calculateUrl($sFileCompletePath,$matches[1][$key]);
		$srcContent=getContents($srcPath);
		if(!$srcContent)
		{
			echo "File does not exist: {$srcPath}=>{$matches[1][$key]}<br>";
		}
		$sFileContent=str_replace($value,"<style>{$srcContent}</style>",$sFileContent);
	}
	//读取JS放到<script></script>标签之内
	$regJs='/\<script src\=\"([\w\d\.\-\/]+\.js)\"\>\<\/script\>/i';
	preg_match_all($regJs, $sFileContent, $matches);
	foreach ($matches[0] as $key => $value) {
		$srcPath=calculateUrl($sFileCompletePath,$matches[1][$key]);
		$srcContent=getContents($srcPath);
		if(!$srcContent)
		{
			echo "File does not exist: {$srcPath}=>{$matches[1][$key]}<br>";
		}
		$sFileContent=str_replace($value,"<script>{$srcContent}</script>",$sFileContent);
	}
	return $sFileContent;
}

