/*
防双击选取功能
*/

define(function(require,exports,module){
	return function(obj){
		if(typeof obj.onselectstart!='undefined')
		{
			obj.onselectstart=new Function("return false");
		}
		else
		{
			obj.onmousedown=new Function("return false");
			obj.onmouseup=new Function("return true");
		}
	}
});