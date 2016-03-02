/**
 * 小提示窗
 * 会生成全局变量ALERT及CONFIRM
 */

define('WINLIT',[],function(require,exports,module){
	var WINLIT=$(".WINLIT"),
		container=WINLIT.closest('.FullScreenPlugin');
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
					$scope.confirm=$.isFunction(onconfirm) ? onconfirm : close;
					$scope.cancel=$.isFunction(oncancel) ? oncancel : close;
					$scope.close=$.isFunction(oncancel) ? oncancel : close;
				},0);
			}
			$scope.open=function(delay){
				(!delay || isNaN(delay)) && (delay=0);
				container.delay(delay).fadeIn();
			}
			$scope.confirm=$scope.close;
			$scope.cancel=$scope.close;

			ALERT=$scope.alert=function(title,content,emotion,onclose){
				$scope.mode='ALERT';
				setWords(title,content,emotion);
				setFuns(onclose);
				$scope.open(100);
			}
			CONFIRM=$scope.confirm=function(title,content,emotion,onconfirm,oncancel,onclose){
				$scope.mode='CONFIRM';
				setWords(title,content,emotion);
				setFuns(onclose,onconfirm,oncancel);
				$scope.open(100);
			}
			function close(delay){
				(!delay || isNaN(delay)) && (delay=0);
				container.delay(delay).fadeOut();
			}
			ALERT.close=CONFIRM.close=$scope.close=close;
		}]);
	angular.bootstrap(WINLIT, ['Winlit']);
});

seajs.use('WINLIT');