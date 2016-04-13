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
	angular.module("TOPLINKS",[])
		.controller("CtrlTopLinks",['$scope',function($scope){
			function loginOpen(){
				var scopeLogin=angular.element(".LOGIN").scope();
				scopeLogin.open();
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
		}]);
	angular.bootstrap($(".TOPLINKS"),['TOPLINKS']);
	$(".TOPLINKS .links,.USERMENU").css({
		visibility: 'visible'
	})
	return ;
});

seajs.use('usermenu');