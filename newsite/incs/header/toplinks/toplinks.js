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
	angular.module("TopLinks",[])
		.controller("CtrlTopLinks",['$scope','$timeout',function($scope,$timeout){
			function loginOpen(){
				angular.element(".LOGIN").scope().open();
			}
			$scope.login=function(){
				if(!$(".LOGIN").length)
					$.ajax({
						url: '/ajax/loadPlugin.php',
						type: 'POST',
						dataType: 'html',
						data: {plugin: 'login'},
					})
					.success(function(data) {
						$("body").append(data);
						loginOpen();
					});
				else loginOpen();
			}
			$scope.logout=function(){
				$timeout(function(){
					$scope.online=false;
					$timeout(show,100);
				},100);
			}
		}]);
	angular.bootstrap(oJQ,['TopLinks']);
	
	function show(){
		oJQ.children().css({
			visibility: 'visible'
		})
	}
	show();
	return ;
});
seajs.use('toplinks');