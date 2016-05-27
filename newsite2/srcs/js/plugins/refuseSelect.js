/**
 * //拒绝双击选择或拖选
 * @authors Your Name (you@example.org)
 * @date    2016-05-13 14:14:50
 * @version $Id$
 */

define(function(require,exports,module){
	return function (obj){
		if(typeof obj.onselectstart!='undefined')
		{
			obj.onselectstart=new Function("return false");
		}
		else
		{
			obj.onmousedown=new Function("return false");
			obj.onmouseup=new Function("return true");
		}
	};
});