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
function parseTemplate($sFilepath,$aData)
{
	if(!file_exists(PATH_FROM_ROOT.$sFilepath))
	{
		echo "File does not exist: ".PATH_FROM_ROOT.$sFilepath."<br>";
		return '';
	}
	$sFileContent=file_get_contents(PATH_FROM_ROOT.$sFilepath);
	if(ON)
	{
		echo "<strong>Parse template ".PATH_FROM_ROOT.$sFilepath." using data </strong>";
		var_dump($aData);
		echo "<br>";
	}
	//遍历所有include标志，来读取子文件嵌套
	$regIncludes='/<!--[\s]*include[\s\S]+?-->/i';
	preg_match_all($regIncludes, $sFileContent, $aIncludes);
	$aIncludes=$aIncludes[0];
	if(count($aIncludes))
	{
		$all='="([\s\S]+?(?<!\\\\))"';
		foreach($aIncludes as $value)
		{
			//读取文件路径 
			$regSrc='/src="((?:\.{1,2}\/)*(?:[\w\d_]+\/)*[\w\d_\-]+(?:\.[\w\d_\-]+)+)"/i';
			preg_match_all($regSrc, $value, $matches);
			if(!count($matches[1]))
			{
				echo 'Signal "include" does not have the attribute "src": '.htmlentities($value).'<br>';
				continue;
			}
			$srcCur=$matches[1][0];
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
			//开始循环
			switch($repeats)
			{
				case 0://不循环，直接用数据来填充
					$parsedString=parseTemplate($srcCur,$aCurData);
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
						$parsedString[]=parseTemplate($srcCur,$aCurData[$n]);
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
			//echo 'variable <var>'.$aVars[$key].'</var> has value: '. $aData[$value] .'<br>';
			$sFileContent=str_replace($aVars[$key], $aData[$value], $sFileContent);
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