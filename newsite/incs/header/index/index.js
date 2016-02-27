/** 首页头文件碎片使用的js
 */

define('/incs/header/index/index',['../usermenu/usermenu','../topcart/topcart'],function(require,exports,module){
	require('../usermenu/usermenu');
	require('../topcart/topcart');
	return ;
});

seajs.use('/incs/header/index/index');