<?php
//根据流程图敲

define("WEBROOT_AT_DISK",$_SERVER["DOCUMENT_ROOT"]);
define("WEBROOT_AT_HOST",'http://'.$_SERVER["HTTP_HOST"]);

function say($words,$color='black'){
	echo '<blockquote style="color:'.$color.'; background-color:#eee; border:1px solid gray; margin:10px; padding:20px;">'.htmlspecialchars($words).'</blockquote>'.PHP_EOL;
}
function warn($words){
	say($words,'#930');
}
function info($words){
	say($words,'blue');
}
function error($words){
	say($words,'red');
}
function success($words){
	say($words,'green');
}
function dump($v){
	if(is_array($v)){
		array_walk_recursive($v, function(&$value,$key){
			$value=htmlspecialchars($value);
		});
	}
	echo '<pre style="background-color:#f0f0f0; font-size:12px; border:1px solid gray; margin:10px; padding:20px;">';
	var_dump($v);
	echo '</pre>';
}


function outputPage($urlRel,$aData){
	$urlAbs=calAbsUrl($urlRel);
	$txtCnt=getContent('/cache'.$urlAbs);
	if($txtCnt===false) $txtCnt=writeCache($urlAbs);	
	return parseContent($txtCnt,$aData);
}

function getContent($urlAbs){
	$txtCnt=@file_get_contents(WEBROOT_AT_DISK. $urlAbs);
	if($txtCnt!==false) locateMedias($txtCnt,$urlAbs);
	return $txtCnt;
}

function calAbsUrl($urlRel,$urlBase='/'){
	$regLocalSrc='/((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+)/i';
	$regDS='/(?<=\/)\.\//i';
	$regDDS='/\/[\w\d]+\/\.\.\//i';
	$regFileName='/[\w\d]+\.\w+$/i';
	if(!preg_match($regLocalSrc, $urlRel) || $urlRel[0]==='/') return $urlRel;
	if($urlBase[0]!=='/') $urlBase=calAbsUrl($urlBase);
	$urlBasePath=preg_replace($regFileName, '', $urlBase);
	$urlFullPath=preg_replace($regDS,'', $urlBasePath. $urlRel);
	while(preg_match($regDDS, $urlFullPath)){
		$urlFullPath=preg_replace($regDDS, '/', $urlFullPath);
	}
	return strpos($urlFullPath, '../')===false ? $urlFullPath : false;
}

function writeCache($urlAbs){
	static $urlRootPage='';
	static $aCss=array();
	static $aJs=array();
	static $regScript='/<script src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.js)"><\/script>/i';
	static $regLink='/<link rel="stylesheet" href="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.css)" *\/?>/i';
	static $regIncInline='/<!-- include src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.html)"[\s\S]*? -->/i';
	if($urlRootPage==='') $urlRootPage=$urlAbs;
	$txtCnt=getContent($urlAbs);
	if($txtCnt!==false){
		collectResources($regLink,$txtCnt,$urlAbs,$aCss);
		collectResources($regScript,$txtCnt,$urlAbs,$aJs);
		preg_match_all($regIncInline, $txtCnt, $aIncs);
		for ($cntIncs=0; $cntIncs < count($aIncs[0]); $cntIncs++) { 
			$sInclude=$aIncs[0][$cntIncs];
			$urlIncRel=$aIncs[1][$cntIncs];
			$urlIncAbs=calAbsUrl($urlIncRel,$urlAbs);
			$txtIncCnt=writeCache($urlIncAbs);
			if($txtIncCnt===false) $txtIncCnt="<div>NO FILE {$urlIncRel} in {$urlAbs} !!!</div>";
			$sIncludeHead=str_replace(array($urlIncRel,'include'), array($urlIncAbs,'include beginning'), $sInclude);
			$txtCnt=str_replace($sInclude, $sIncludeHead. $txtIncCnt. "<!-- include ending src=\"{$urlIncAbs}\" -->", $txtCnt);
		}
	}
	if($urlRootPage===$urlAbs){
		$aCss=packageResources($aCss);
		array_walk($aCss, function(&$value,$key){
			$value="<link rel=\"stylesheet\" href=\"{$value}\">";
		});
		$aJs=packageResources($aJs);
		usort($aJs, function($a,$b){
			return $a>$b;
		});
		array_walk($aJs, function(&$value,$key){
			$value="<script src=\"{$value}\"></script>";
		});
		$txtCnt=str_replace(array('</head>','</body>'), array(implode(PHP_EOL, $aCss).'</head>',implode(PHP_EOL, $aJs).'</body>'), $txtCnt);
		writeFile('/cache'.$urlAbs, $txtCnt);
		$urlRootPage='';
		$aCss=$aJs=array();
	}
	return $txtCnt;
}

function collectResources($reg,&$txtCnt,$urlBase,&$aContainer){
	preg_match_all($reg, $txtCnt, $aResources);
	for ($cntRess=0; $cntRess < count($aResources[0]); $cntRess++) { 
		$sResource=$aResources[0][$cntRess];
		$urlRel=$aResources[1][$cntRess];
		$urlAbs=calAbsUrl($urlRel,$urlBase);
		$txtCnt=str_replace($sResource, '', $txtCnt);
		$aContainer[]=$urlAbs;
	}
}

function packageResources($aResources){
	array_unique($aResources);
	$aPaths=array();
	foreach ($aResources as $sResource) {
		$aNodes=explode('/', $sResource);
		array_shift($aNodes);
		$ptr=&$aPaths;
		$lenNodes=count($aNodes);
		foreach ($aNodes as $cntNodes => $sNode) {
			if(!isset($ptr[$sNode])){
				switch ($lenNodes - $cntNodes) {
					case 1:
						$ptr[] = $sNode;
						break 2;
					case 2:
						if($cntNodes!==0){
							$sLastNode=$aNodes[$lenNodes-1];
							if(preg_match("/^{$sNode}\.(js|css)/i", $sLastNode)){
								$ptr[]=$sNode . '/'. $sLastNode;
								break 2;
							}
						}
					default:
						$ptr[$sNode]=array();
						break;
				}
			}
			$ptr=&$ptr[$sNode];
		}
	}
	return packaging($aPaths);
}

function packaging($aPaths,$sParPath=''){
	static $aFiles=array();
	$aNames=$aURLs=array();
	$regNameZip='/_([\w\d]+)\/\1/i';
	$regExtName='/\.\w+_/i';
	foreach ($aPaths as $sDir => $sKid) {
		if(is_array($sKid)) packaging($sKid,$sParPath.'/'.$sDir);
		else{
			// $aCnts[]=getContent($sParPath.'/'.$sKid);
			$aURLs[]=$sParPath.'/'.$sKid;
			$aNames[]=$sKid;
		}
	}
	if(count($aNames)){
		$sName=$sParPath.'/'. implode('_', $aNames);
		$sName='/cache'.preg_replace(array($regExtName,$regNameZip), array('_','_$1'), $sName);
		if(!file_exists($sName)){
			$aCnts=array();
			foreach ($aURLs as $urlAbs) {
				$aCnts[]=getContent($urlAbs);
			}
			$txtCnt=implode(PHP_EOL,$aCnts);
			$md5_print=substr(md5($txtCnt),0,6);
			writeFile($sName,$txtCnt);
		}
		$aFiles[]=WEBROOT_AT_HOST. $sName.'?'.$md5_print;
	}
	elseif($sParPath===''){
		$aPkgs=$aFiles;
		$aFiles=array();
		return $aPkgs;
	}
	return ;
}

function parseContent($txtCnt,$aData){
	$regIncBlock='/<!-- include beginning src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.html)" *(?:condition="([^\"]+)")? *(?:variable="([^\"]+)")? *(?:repeats="([^\"]+)")? *-->([\s\S]*)<!-- include ending src="\1" -->/i';
	preg_match_all($regIncBlock, $txtCnt, $aIncs);
	for ($cntIncs=0; $cntIncs < count($aIncs[0]); $cntIncs++) { 
		$sInclude=$aIncs[0][$cntIncs];
		$sSrcRel=$aIncs[1][$cntIncs];
		$sCondition=$aIncs[2][$cntIncs];
		$sVariable=$aIncs[3][$cntIncs];
		$sRepeats=$aIncs[4][$cntIncs];
		$sContent=$aIncs[5][$cntIncs];
		if($sCondition!==''){
			$bool=eval("return $sCondition;");
			if(!$bool) $txtCnt=str_replace($sInclude, '', $txtCnt);
		}
		if($sVariable==='') $aVariable=$aData;
		else{
			$aVariable=eval("return $sVariable;");
			if(!isset($aVariable)){
				echo "{$sVariable} doesn't exist!!!";
				continue;
			}
		}
		if($sRepeats===""){
			$sContent=parseContent($sContent,$aVariable);
		}else{
			$piRepeat=eval("return $sRepeats;");
			$piLength=count($aVariable);
			$aContents=array();
			if($piRepeat===-1) $maxRepeat=$piLength;
			else $maxRepeat=min($piRepeat,$piLength);
			for ($cntRepeat=0; $cntRepeat < $maxRepeat; $cntRepeat++) { 
				$aVar=&$aVariable[$cntRepeat];
				$aVar['index']=$cntRepeat;
				$aContents[]=parseContent($sContent,$aVar);
			}
			$sContent=implode('', $aContents);
		}
		$txtCnt=str_replace($sInclude,$sContent,$txtCnt);
	}
	$regModels='/\{\$(\w[\w\d]+)\}/i';
	preg_match_all($regModels, $txtCnt, $aModels);
	for ($cntModels=0; $cntModels < count($aModels[0]); $cntModels++) { 
		$sModel=$aModels[0][$cntModels];
		$sKey=$aModels[1][$cntModels];
		$value= isset($aData[$sKey]) ? $aData[$sKey] : "NO <var>{$sKey}</var>";
		$txtCnt=str_replace($sModel, $value, $txtCnt);
	}
	return $txtCnt;
}

function locateMedias(&$txtCnt,$urlAbs){
	$regMedias='/<(?:img|video|audio|embed|source)[^\>]*src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+)"/i';
	$regUrls='/url\([\'\"]?((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+(?:[\?\#][\w\d]+)*)[\'\"]?\)/';
	$regSuffix='/[\?\#][\w\d]+/i';
	preg_match('/\.(js|css|html)/i', $urlAbs,$matches);
	switch ($matches[1]) {
		case 'js':
			// $txtCnt=minify($txtCnt);
			return ;
		
		case 'css':
			$reg=$regUrls;
			break;
		
		case 'html':
			$reg=$regMedias;
			break;
		
		default:
			echo "UNEXPECTED TYPE OF FILE!!!";
			return false;
	}
	preg_match_all($reg, $txtCnt, $aSrcs);
	foreach ($aSrcs[1] as $urlResRel) {
		$urlResAbs=calAbsUrl(preg_replace($regSuffix,'',$urlResRel),$urlAbs);
		$md5_print=@md5_file(WEBROOT_AT_DISK.$urlResAbs);
		if($md5_print===false) echo "File doesn't exist!!! <s>{$urlResRel}</s> in <em>{$urlAbs}</em>";
		else $txtCnt=str_replace($urlResRel, WEBROOT_AT_HOST.$urlResAbs.'?'.substr($md5_print, 0,6),$txtCnt);
	}
	return ;
}

function writeFile($urlAbs,$txtCnt){
	$bool=@file_put_contents(WEBROOT_AT_DISK.$urlAbs, $txtCnt);
	if($bool!==false) return ;
	$aDirs=explode('/', $urlAbs);
	array_shift($aDirs);
	$dirCur=WEBROOT_AT_DISK;
	for ($cntDirs=0; $cntDirs < count($aDirs) -1; $cntDirs++) { 
		$dirCur.='/'.$aDirs[$cntDirs];
		if(!is_dir($dirCur)) mkdir($dirCur);
	}
	file_put_contents(WEBROOT_AT_DISK.$urlAbs, $txtCnt);
}

function loadPlugin($sName){
	$regScript='/<script src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.js)"><\/script>/i';
	$regLink='/<link rel="stylesheet" href="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.css)" *\/?>/i';
	$urlPlugin="/incs/{$sName}/{$sName}.html";
	$txtCnt=getContent('/cache'.$urlPlugin);
	if($txtCnt!==false) return $txtCnt;
	$txtCnt=getContent($urlPlugin);
	if($txtCnt===false) return false;
	referenceResources($regLink,$txtCnt,$urlPlugin,'css');
	referenceResources($regScript,$txtCnt,$urlPlugin,'js');
	return writeFile('/cache'.$urlPlugin,$txtCnt);
}

function referenceResources($reg,&$txtCnt,$urlBase,$sType){
	preg_match_all($reg, $txtCnt, $aSrcs);
	$aCnts=array();
	for ($cntSrcs=0; $cntSrcs < count($aSrcs[0]); $cntSrcs++) { 
		$sResource=$aSrcs[0][$cntSrcs];
		$urlRel=$aSrcs[1][$cntSrcs];
		$urlAbs=calAbsUrl($urlRel,$urlBase);
		$txtSrc=getContent($urlAbs);
		$txtCnt=str_replace($sResource,'', $txtCnt);
		if($txtSrc===false) echo "File doesn't exist!!! {$urlRel} in {$urlBase}";
		else $aCnts[]=$txtCnt;
	}
	$txtSrc=implode('', $aCnts);
	switch ($sType) {
		case 'js':
			$txtCnt='<style>' . $txtSrc. '</style>' . $txtCnt;
			break;
		case 'value':
			$txtCnt.='<script>'. $txtSrc. '</script>';
			break;
		
		default:
			# code...
			break;
	}
	return ;
}
