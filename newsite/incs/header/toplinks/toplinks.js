/**
 * 顶用户菜单
 */
define('toplinks',function(require,exports,module){
	//鼠标指向用户菜单时，菜单下滑
	var oJQ=$(".TOPLINKS").on('mouseenter', '.USERMENU', function(event) {
		$(this).addClass('on').find('dd ul').stop(true).slideDown();
	}).on('mouseleave', '.USERMENU', function(event) {
		$(this).find('dd ul').stop(true).slideUp(function(){
			$(".USERMENU").removeClass('on');
		});
	});
	//根据用户登陆状态来判断显示菜单的哪一部分
	angular.module('Main')
		.controller("CtrlTopLinks",['$scope','$timeout','$rootScope',function($scope,$timeout,$rootScope){
			$rootScope.online=$scope.online;
			//登录动作，召唤登录框
			$scope.login=function(){
				$rootScope.$broadcast('startLogin');
			}
			//登出动作，发送登出事件
			$scope.logout=function(){
				$timeout(function(){
					$rootScope.online=$scope.online=false;
					//发送登出事件
					$rootScope.$broadcast('logout');
					$timeout(function(){
						show();
					},100);
				},100);
			}
			//接收登录成功事件
			$scope.$on('loginOK',function(event){
				$timeout(function(){
					$rootScope.online=$scope.online=true;
					show();
				});
			});
		}]);
	
	function show(){
		oJQ.children().css({
			visibility: 'visible'
		})
	}
	show();
	return ;
});
seajs.use('toplinks');