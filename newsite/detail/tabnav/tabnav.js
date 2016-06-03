/**
 * 滚动固定监听标签导航
 * @authors Your Name (you@example.org)
 * @date    2016-06-03 16:16:05
 * @version $Id$
 */

define('tabnav',function(require,exports,module){
	angular.module('Main')
	.controller('CtrlTabNav', ['$scope', function ($scope) {
		$scope.curpro;
		$scope.$on("proChange",function(event, curpro){
			$scope.curpro=curpro;
		})
	}])
	//调用fixed跟navigator，作用在导航上
	require.async(["effects/navigator","effects/fixed"],function(CHInav,CHIfixed){
		CHIfixed(".TabNav");
		CHInav(".TabNav .nav li",".Contents",{
			offset:-100
		});
	});
	$(window).resize(function(){
		$(".fixed.fixed-top").has(".TabNav").width($(window).width());
	});
	return ;
});
seajs.use('tabnav');