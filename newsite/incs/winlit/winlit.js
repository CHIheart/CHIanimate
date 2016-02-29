/**
 * 小提示窗
 */

define(function(require,exports,module){
	var SCOPE,done;
	$.ajax({
		url: './incs/winlit/winlit.html',
		dataType: 'html',
	})
	.success(function(response) {
		//将模板内容资源替换后加入到页面中
		//先加CSS，再加HTML，以防页面刷新样式抖动
		response=response.replace(/\{STATIC_RESOURCE_URI\}/ig,'');
		var links=response.match(/\<link rel=\"stylesheet\" href=\"[\w\d\-\_\/]+.css\"\>/ig);
		for(var n=0; n<links.length;n++) response=response.replace(links[n],'');
		$("body").append(links.join(' '));
		setTimeout(function(){
			$("body").append(response);
			//自举生成独立应用
			angular.module('Winlit',[])
				.controller('CtrlWinlit',['$scope','$timeout',function($scope,$timeout){
					$scope.title='标题';
					$scope.content="内容";
					$scope.emotion='smile';
					function setWords(title,content,emotion){
						$timeout(function(){
							title && ($scope.title=title);
							content && ($scope.content=content);
							emotion && ($scope.emotion=emotion);
						},0);
					}
					function setFuns(onclose,onconfirm,oncancel){
						$timeout(function(){
							$.isFunction(onconfirm) && ($scope.confirm=onconfirm);
							$.isFunction(oncancel) && ($scope.cancel=oncancel);
							$.isFunction(onclose) && ($scope.close=onclose);
						},0);
					}
					$scope.open=function(){
						$('.WINLIT').fadeIn();
					}
					$scope.close=function(){
						$('.WINLIT').fadeOut();
					}
					$scope.confirm=$scope.close;
					$scope.cancel=$scope.close;

					ALERT=$scope.alert=function(title,content,emotion,onclose){
						$scope.mode='ALERT';
						setWords(title,content,emotion);
						setFuns(onclose);
						$scope.open();
					}
					CONFIRM=$scope.confirm=function(title,content,emotion,onconfirm,oncancel,onclose){
						$scope.mode='CONFIRM';
						setWords(title,content,emotion);
						setFuns(onclose,onconfirm,oncancel);
						$scope.open();
					}
				}]);
			angular.bootstrap($('.WINLIT'), ['Winlit']);
			SCOPE=angular.element('.WINLIT').scope();
			done();
		},100);
	});
	return function(f){
		done ? done() : done=f;
	}
});