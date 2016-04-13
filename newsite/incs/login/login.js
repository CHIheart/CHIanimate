/**
 * 登陆插件，登陆成功后会局部刷新页面
 */

define('LOGIN',[],function(require,exports,module){
	var LOGIN=$(".LOGIN"),
		container=LOGIN.closest('.FullScreenPlugin');
	angular.module('Login',[])
		.controller('CtrlLogin',['$scope','$timeout',function($scope,$timeout){
            $scope.judge=function(name){
                return $("#"+name).val() ? 'ng-filled' : 'ng-empty';
            }
			$scope.open=function(){
				container.fadeIn();
			}
			$scope.close=function(){
				container.fadeOut();
				this.reset();
			}
			$scope.login=function(){
				console.log(this.LoginForm);
				alert('login')
			}
			$scope.reset=function(){
				this.passport='';
				this.password='';
				var form=this.LoginForm;
				form.passport.$setPristine();
				form.password.$setPristine();
				$(".ng-touched",LOGIN).each(function(index, el) {
					$(this).addClass('ng-untouched').removeClass('ng-touched').one('blur', function(event) {
						$(this).removeClass('ng-untouched').addClass('ng-touched');
					});
				});
			}
		}]);
	angular.bootstrap(LOGIN,['Login']);
	//点过再失焦后，更换成触摸类
	$(".ng-untouched",LOGIN).one('blur', function(event) {
		$(this).removeClass('ng-untouched').addClass('ng-touched');
	});
	return ;
});

seajs.use('LOGIN');