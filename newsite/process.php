<?php
include "uglify.php";
//根据流程图敲

define("WEBROOT_AT_DISK",$_SERVER["DOCUMENT_ROOT"]);
define("WEBROOT_AT_HOST",'http://'.$_SERVER["HTTP_HOST"]);
define("DEVELOPING",true);
define("PACKAGE_AT_HOST", "/cache");
define("TEMPORARY_JS", "/tmp.js");

function scream($words){
	echo "<h1>{$words}</h1>";
}
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
	$txtCnt=DEVELOPING ? false : getContent(PACKAGE_AT_HOST.$urlAbs);
	if($txtCnt===false || DEVELOPING) $txtCnt=writeCache($urlAbs);	
	return parseContent($txtCnt,$aData);
}

function getContent($urlAbs){
	$txtCnt=@file_get_contents(WEBROOT_AT_DISK. $urlAbs);
	if($txtCnt!==false) locateMedias($txtCnt,$urlAbs);
	return $txtCnt;
}

function calAbsUrl($urlRel,$urlBase='/'){
	static $regLocalSrc='/((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+)/i';
	static $regDS='/(?<=\/)\.\//i';
	static $regDDS='/\/[\w\d]+\/\.\.\//i';
	static $regFileName='/[\w\d]+\.\w+$/i';
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
	static $aCss=[];
	static $aJs=[];
	static $regScript='/<script src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.js)"><\/script>/i';
	static $regLink='/<link rel="stylesheet" href="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.css)" *\/?>/i';
	static $regIncInline='/<!-- include src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.html)"[\s\S]*? -->/i';
	static $regSrc='/(?<=script src=")(\/src[^"]+?)(?=")/i';
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
			$sIncludeHead=str_replace([$urlIncRel,'include'], [$urlIncAbs,'include beginning'], $sInclude);
			$txtCnt=str_replace($sInclude, $sIncludeHead. $txtIncCnt. "<!-- include ending src=\"{$urlIncAbs}\" -->", $txtCnt);
		}
	}
	if($urlRootPage===$urlAbs){
		if(!DEVELOPING){
			array_walk($aCss, function($value,$key){
				$fileLess=str_replace(".css", ".less", WEBROOT_AT_DISK.$value);
				$fileCss =WEBROOT_AT_DISK.$value;
				$command = "lessc --clean-css $fileLess $fileCss -s";
				exec($command, $output, $returnCode);
				if($returnCode !== 0) {
					echo "$command excuted error!!!<br>";
				}
			});
		}
		$aCss=packageResources($aCss);
		array_walk($aCss, function(&$value,$key){
			$value="<link rel=\"stylesheet\" href=\"{$value}\">";
		});
		$aJs=packageResources($aJs);
		usort($aJs, "jsRacing");
		array_walk($aJs, function(&$value,$key){
			$value="<script src=\"{$value}\"></script>";
		});
		$regScriptOthers='/<script src="[^"]+?\.js"><\/script>/i';
		preg_match_all($regScriptOthers,$txtCnt,$aOthers);
		$aOthers=$aOthers[0];
		$txtCnt=str_replace($aOthers, '', $txtCnt);
  		$txtCnt=str_replace(['</head>','</body>'], [implode(PHP_EOL, $aCss).'</head>',implode(PHP_EOL, $aOthers).implode(PHP_EOL, $aJs).'</body>'], $txtCnt);
  		$txtCnt=preg_replace($regSrc, WEBROOT_AT_HOST."$1", $txtCnt);
		writeFile(PACKAGE_AT_HOST.$urlAbs, $txtCnt);
		$urlRootPage='';
		$aCss=$aJs=[];
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
	$aResources=array_unique($aResources);
	$aPaths=[];
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
						$ptr[$sNode]=[];
						break;
				}
			}
			$ptr=&$ptr[$sNode];
		}
	}
	return packaging($aPaths);
}

function getExtName($sFilename){
	$regSuffix='/\.(js|css|html)(?:(?=[\?\#][\w\d]+)*|$)/i';
	preg_match($regSuffix, $sFilename,$matches);
	return count($matches) ? $matches[1] : false;
}

function packaging($aPaths,$sParPath=''){
	static $aFiles=[];
	$aNames=$aURLs=[];
	static $regNameZip='/_([\w\d]+)\/\1/i';
	static $regExtName='/\.\w+_/i';
	foreach ($aPaths as $sDir => $sKid) {
		if(is_array($sKid)) packaging($sKid,$sParPath.'/'.$sDir);
		else{
			$aURLs[]=$sParPath.'/'.$sKid;
			$aNames[]=$sKid;
		}
	}
	if(count($aNames)){
		if(strpos($sParPath, '/srcs/')===false){
			$aNames=[implode('_', $aNames)];
		}
		foreach ($aNames as $sName) {
			$sName=PACKAGE_AT_HOST.preg_replace([$regExtName,$regNameZip], ['_','_$1'], $sParPath.'/'.$sName);
			if(!file_exists($sName) || DEVELOPING){
				$aCnts=[];
				foreach ($aURLs as $urlAbs) {
					$aCnts[]=getContent($urlAbs);
				}
				$txtCnt=implode(PHP_EOL,$aCnts);
				$extName=getExtName($sName);
				writeFile($sName,$txtCnt);
				if(!DEVELOPING && $extName=='js'){
					$ug = new JSUglify2();
					$ug->uglify([WEBROOT_AT_DISK .$sName], WEBROOT_AT_DISK .$sName);
				}
			}
			$md5_print=md5_file(WEBROOT_AT_DISK . $sName);
			$aFiles[]=WEBROOT_AT_HOST. $sName.'?'.substr($md5_print, 0,6);
		}
	}
	elseif($sParPath===''){
		$aPkgs=$aFiles;
		$aFiles=[];
		return $aPkgs;
	}
	return ;
}

function parseContent($txtCnt,$aData){
	$regIncBlock='/<!-- include beginning src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.html)" *(?:condition="([^\"]+)")? *(?:variable="([^\"]+)")? *(?:repeats="([^\"]+)")? *-->([\s\S]*?)<!-- include ending src="\1" -->/i';
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
			if(!$bool){
				$txtCnt=str_replace($sInclude, '', $txtCnt);
				continue;
			}
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
			$aContents=[];
			if($piRepeat===-1) $maxRepeat=$piLength;
			else $maxRepeat=min($piRepeat,$piLength);
			for ($cntRepeat=0; $cntRepeat < $maxRepeat; $cntRepeat++) { 
				$aVar=&$aVariable[$cntRepeat];
				$aVar['index']=$cntRepeat;
				$aVar['of']=$piLength;
				$aContents[]=parseContent($sContent,$aVar);
			}
			$sContent=implode('', $aContents);
		}
		$txtCnt=str_replace($sInclude,$sContent,$txtCnt);
	}
	$regModels='/[^\{](\{\$(\w[\w\d]+)\})[^\}]/i';
	preg_match_all($regModels, $txtCnt, $aModels);
	for ($cntModels=0; $cntModels < count($aModels[0]); $cntModels++) { 
		$sModel=$aModels[1][$cntModels];
		$sKey=$aModels[2][$cntModels];
		$value= isset($aData[$sKey]) ? $aData[$sKey] : "NO <var>{$sKey}</var>";
		$txtCnt=str_replace($sModel, $value, $txtCnt);
	}
	return $txtCnt;
}

function locateMedias(&$txtCnt,$urlAbs){
	static $regMedias='/<(?:img|video|audio|embed|source)[^\>]*src="((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+)"/i';
	static $regUrls='/url\([\'\"]?((?:\.{0,2}\/)*(?:[\w\d]+\/)*[\w\d]+\.\w+(?:[\?\#][\w\d]+)*)[\'\"]?\)/';
	static $regSuffix='/[\?\#][\w\d]+/i';
	static $regRequire='/require(?:\.async)?\([\'\"]((?:\.{0,2}\/)*[\w\d]+(?:\/[\w\d]+)*(?:\.js)?)[\'\"]/i';
	static $regIcon='/link href="(\/src[^"]+)"/i';
	static $regDDS='/^\.{0,2}\//i';
	$extName=getExtName($urlAbs);
	switch ($extName) {
		case 'js':
			$reg=$regRequire;
			break;

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
	$aSrcs=array_unique($aSrcs[1]);
	foreach ($aSrcs as $urlRes) {
		if($extName=='js'){
			$urlResRel=$urlRes . (preg_match('/\.js$/i', $urlRes) ? "" : ".js");
			$urlResource=preg_match($regDDS, $urlResRel) ? calAbsUrl($urlResRel,$urlAbs) : "/srcs/js/".$urlResRel;
			$urlResAbs=PACKAGE_AT_HOST.$urlResource;
			$txtSubCnt=getContent($urlResource);
			locateMedias($txtSubCnt, $urlResAbs);
			writeFile($urlResAbs, $txtSubCnt);
			if(!DEVELOPING){
				$ug=new JSUglify2();
				$ug->uglify([WEBROOT_AT_DISK.$urlResAbs],WEBROOT_AT_DISK.$urlResAbs);
			}
		}else{
			$urlResAbs=calAbsUrl(preg_replace($regSuffix,'',$urlRes),$urlAbs);
		}
		$md5_print=@md5_file(WEBROOT_AT_DISK.$urlResAbs);
		if($md5_print===false) echo "File doesn't exist!!! <s>{$urlRes}</s> in <em>{$urlAbs}</em>";
		else{
			$urlResAbs=WEBROOT_AT_HOST.$urlResAbs.'?'.substr($md5_print,0,6);
			$txtCnt=str_replace($urlRes, $urlResAbs, $txtCnt);
		}
	}
	preg_match_all($regIcon, $txtCnt, $aIcons);
	$aIcons=$aIcons[1];
	foreach ($aIcons as $urlIcon) {
		$md5_print=@md5_file(WEBROOT_AT_DISK.$urlIcon);
		$urlIconAbs=WEBROOT_AT_HOST.$urlIcon.'?'.substr($md5_print,0,6);
		$txtCnt=str_replace($urlIcon, $urlIconAbs, $txtCnt);
	}
	return ;
}

function writeFile($urlAbs,$txtCnt){
	$extName=getExtName($urlAbs);
	switch ($extName) {
		case 'js':
			$comment=["//",""];
			break;
		
		case 'html':
			$comment=["<!--","-->"];
			break;
		
		case 'css':
			$comment=["/*","*/"];
			break;
		
		default:
			$comment=["",""];
			break;
	}
	$txtCnt=$comment[0]."Written by PROCESS.PHP at the time of ".Date("Y-m-d H:i:s").$comment[1].PHP_EOL . $txtCnt;
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
	$txtCnt=DEVELOPING ? false : getContent(PACKAGE_AT_HOST.$urlPlugin);
	if($txtCnt!==false) return $txtCnt;
	$txtCnt=getContent($urlPlugin);
	if($txtCnt===false) return false;
	referenceResources($regLink,$txtCnt,$urlPlugin,'css');
	referenceResources($regScript,$txtCnt,$urlPlugin,'js');
	writeFile(PACKAGE_AT_HOST.$urlPlugin,$txtCnt);
	return $txtCnt;
}

function referenceResources($reg,&$txtCnt,$urlBase,$sType){
	preg_match_all($reg, $txtCnt, $aSrcs);
	$aCnts=[];
	for ($cntSrcs=0; $cntSrcs < count($aSrcs[0]); $cntSrcs++) { 
		$sResource=$aSrcs[0][$cntSrcs];
		$urlRel=$aSrcs[1][$cntSrcs];
		$urlAbs=calAbsUrl($urlRel,$urlBase);
		$txtSrc=getContent($urlAbs);
		$txtCnt=str_replace($sResource,'', $txtCnt);
		if($txtSrc===false) echo "File doesn't exist!!! {$urlRel} in {$urlBase}";
		else $aCnts[]=$txtSrc;
	}
	$txtSrc=implode('', $aCnts);
	switch ($sType) {
		case 'css':
			$txtCnt='<style>' . $txtSrc. '</style>' . $txtCnt;
			break;
		case 'js':
			if(!DEVELOPING){
				$fileTmp=WEBROOT_AT_DISK.TEMPORARY_JS;
				writeFile(TEMPORARY_JS,$txtSrc);
				$ug=new JSUglify2();
				$ug->uglify([$fileTmp], $fileTmp);
				$txtSrc=getContent(TEMPORARY_JS);
				unlink($fileTmp);
			}
			$txtCnt.='<script>'. $txtSrc. '</script>';
			break;
		
		default:
			# code...
			break;
	}
	return ;
}

function jsRacing($url1,$url2){
	$race1=calJsRace($url1);
	$race2=calJsRace($url2);
	$r1=strnatcasecmp($race1,$race2);
	$r2=strnatcasecmp($url1,$url2);
	return $r1 ? $r1 : $r2;
}

function calJsRace($url){
	$dirs=array(
		"srcs"=>["libs","datas","effects","plugins"],
		"incs"=>["head","header","footer","aside"]
	);

	$bits=[];
	$n=0;
	foreach ($dirs as $dir => $kids) {
		if(strpos($url, $dir)!==false){
			$bits[]=$n;
			foreach ($kids as $index => $kid) {
				if(strpos($url, $kid)!==false){
					$bits[]=$index;
					break 2;
				}
			}
			$bits[]=count($kids);
			break;
		}
		else $n++;
	}
	if(!count($bits)) $bits[]=$n.$n;
	return implode('', $bits);
}

