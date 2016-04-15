/**
 * 登陆插件，登陆成功后会局部刷新页面
 */

define('LOGIN',[],function(require,exports,module){
	var LOGIN=$(".LOGIN"),
		container=LOGIN.closest('.FullScreenPlugin'),
		ALERT,ALERTCLOSE;
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
			$.ajax({
				url: '/ajax/header/login',
				type: 'POST',
				dataType: 'json',
				data: $("#LoginForm").serialize(),
			})
			.success(function(data) {
				if(data.result){
					$scope.reset();
					$scope.$apply();
					var scopeUsermenu=angular.element('.TOPLINKS').scope();
					scopeUsermenu.online=true;
					scopeUsermenu.user=data.user;
					scopeUsermenu.$apply();
					$('.TOPLINKS').children().css({
						visibility:'visible'
					});
					$scope.close();
				}else{
					var fail=function(){
						ALERT("登陆失败",data.message,"frown",function(){
							console.log(ALERTCLOSE);
							ALERTCLOSE(0,1);
						});
					},
					getAlert=function(){
						var scopeWinlit=angular.element('.WINLIT').scope();
						ALERT=scopeWinlit.alert;
						ALERTCLOSE=scopeWinlit.close;
					};
					!$(".WINLIT").length ? $.ajax({
						url: '/ajax/loadPlugin.php',
						type: 'POST',
						dataType: 'html',
						data: {plugin: 'winlit'},
					})
					.done(function(html) {
						$("body").append(html);
						getAlert();
						fail();
					})
					: (!ALERT && getAlert() , fail());
				}
			});
		}
		$scope.reset=function(){
			$scope.passport='';
			$scope.password='';
			var form=$scope.LoginForm;
			form.passport.$setPristine();
			form.password.$setPristine();
			$(".ng-touched",LOGIN).each(function(index, el) {
				$(this).addClass('ng-untouched').removeClass('ng-touched').one('blur', function(event) {
					$(this).removeClass('ng-untouched').addClass('ng-touched');
				});
			});
			$scope.reference=true;
		}
		$scope.hasAt=function(){
			return passport.value.indexOf('@')>0;
		}
		$scope.beforeAt=function(){
			var v=passport.value;
			return v.substring(0,v.indexOf('@'));
		}
		$scope.afterAt=function(){
			var v=passport.value;
			return v.substring(v.indexOf('@')+1);
		}
		$scope.setEmail=function(index){
			$timeout(function(){
				$scope.passport=$scope.beforeAt() + '@' + $scope.hosts[index];
				$scope.reference=false;
			},10);
		}
		$scope.setEmail2=function(index){
			$timeout(function(){
				$scope.passport=$scope.beforeAt() + '@' + $scope.hosts[index];
			},10);
		}
		$scope.drop2=function(index){
			$timeout(function(){
				$scope.reference=false;
			},10);
		}
		$scope.hosts=['126.com','163.com','sina.com','yeah.net','qq.com','hotmail.com'];
		$scope.reference=true;
		console.log($scope.passport)
	}]);
	angular.bootstrap(LOGIN,['Login']);
	//点过再失焦后，更换成触摸类
	$(".ng-untouched",LOGIN).one('blur', function(event) {
		$(this).removeClass('ng-untouched').addClass('ng-touched');
	});
	return ;
});

seajs.use('LOGIN');