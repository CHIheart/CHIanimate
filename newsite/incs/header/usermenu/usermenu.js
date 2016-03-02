/**
 * 顶用户菜单
 */

define('usermenu',[],function(require,exports,module){
	//鼠标指向用户菜单时，菜单下滑
	$(".USERMENU").mouseenter(function(event) {
		$(this).addClass('on').find('dd ul').slideDown();
	}).mouseleave(function(event) {
		$(this).find('dd ul').slideUp(function(){
			$(".USERMENU").removeClass('on');
		});
	});

	//根据用户登陆状态来判断显示菜单的哪一部分
	angular.module("TopLinks",[])
		.controller("CtrlTopLinks",['$scope',function($scope){
			//$scope.online=false;
		}]);
	angular.bootstrap($(".TOPLINKS"),['TopLinks']);
	$(".TOPLINKS .links,.USERMENU").css({
		visibility: 'visible'
	})
	return ;
});

seajs.use('usermenu');