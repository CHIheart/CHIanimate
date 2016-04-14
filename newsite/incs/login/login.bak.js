/**
 * 登陆插件，登陆成功后会局部刷新页面
 */

define('LOGIN',[],function(require,exports,module){
	var LOGIN=$(".LOGIN"),
		container=LOGIN.closest('.FullScreenPlugin'),
		ALERT;
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
						ALERT("登陆失败",data.message,"frown");
					},
					getAlert=function(){
						ALERT=angular.element('.WINLIT').scope().alert;
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
		$scope.realName=function(){
			return passport.value;
		}
		$scope.emailTest=function(){
			if(!this.reference) return false;
			var atPos=passport.value.indexOf('@');
			if(atPos>0){
				var emails=[],
					hosts=$scope.hosts,
					name=passport.value.substring(0,atPos)+'@';
				for(var n=0;n<hosts.length;n++)
					emails.push(name+hosts[n]);
				$scope.emails=emails;
				return true;
			}return false;
		}
		$scope.setEmail=function(index){
			$timeout(function(){
				$scope.passport=$scope.emails[index];
				$scope.reference=false;
			},100);
		}
		$scope.hosts=['126.com','163.com','sina.com','yeah.net','qq.com','hotmail.com'];
		$scope.emails;
		$scope.reference=true;
	}]);
	angular.bootstrap(LOGIN,['Login']);
	//点过再失焦后，更换成触摸类
	$(".ng-untouched",LOGIN).one('blur', function(event) {
		$(this).removeClass('ng-untouched').addClass('ng-touched');
	});
	//处于焦点状态的要提高z轴
	$(".TEXTS").focus(function(event) {
		$(this).closest('.TEXTCONTAINER').css({
			zIndex:12
		});
	}).blur(function(event) {
		setTimeout(function(){
			$(this).closest('.TEXTCONTAINER').css({
				zIndex:10
			})
		},200);
	});;
	return ;
});

seajs.use('LOGIN');