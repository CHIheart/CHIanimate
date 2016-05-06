/**
 * 小提示窗
 * 全局应用，使用ALERT与CONFIRM分别调用
 */

define('WINLIT',function(require,exports,module){
	var WINLIT=$(".WINLIT"),
		container=WINLIT.closest('.FullScreenPlugin'),
		others;
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
			});
		}
		function setFuns(onclose,onconfirm,oncancel){
			$timeout(function(){
				$scope.confirm=angular.isFunction(onconfirm) ? onconfirm : close;
				$scope.cancel=angular.isFunction(oncancel) ? oncancel : close;
				$scope.close=angular.isFunction(onclose) ? onclose : close;
			});
		}
		function open(delay){
			(!delay || isNaN(delay)) && (delay=0);
			others=$(".FullScreenPlugin").not(container).fadeOut();
			container.delay(delay).fadeIn();
		}
		//goLast，如果当前小窗是最终操作，则关闭它时，不打开前导窗口（即在打开它之前，显示的那些窗口）
		function close(delay,goLast){
			(!delay || isNaN(delay)) && (delay=0);
			container.delay(delay).fadeOut();
			if(goLast && others) others.fadeIn(),others=null;
		}
		$scope.close=$scope.confirm=$scope.cancel=close;

		window.ALERT=function(title,content,emotion,onclose){
			$scope.mode='ALERT';
			setWords(title,content,emotion);
			setFuns(onclose);
			open(100);
		}
		window.ALERT.close=close;
		window.CONFIRM=function(title,content,emotion,onconfirm,oncancel,onclose){
			$scope.mode='CONFIRM';
			setWords(title,content,emotion);
			setFuns(onclose,onconfirm,oncancel);
			open(100);
		}
		window.CONFIRM.close=close;
	}]);
	angular.bootstrap(WINLIT, ['Winlit']);
});

seajs.use('WINLIT');