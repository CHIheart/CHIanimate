/**
 * 数字调节框
 * @authors Your Name (you@example.org)
 * @date    2016-06-02 10:42:22
 * @version $Id$
 */



define('NUMBER',function(require,exports,module){
	angular.module('Main')
	.controller('CtrlNumber', ['$scope','$timeout','$rootScope', function ($scope,$timeout,$rootScope) {
		$scope.disabled=false;
		$scope.up=function(){
			if($scope.disabled) return;
			if($scope.max) $scope.num=Math.min($scope.max,$scope.num+1);
			else $scope.num++;
			$rootScope.$broadcast('numChange', $scope.num);
		}
		$scope.down=function(){
			if($scope.disabled) return;
			if($scope.min) $scope.num=Math.max($scope.min,$scope.num-1);
			else $scope.num--;
			$rootScope.$broadcast('numChange', $scope.num);
		}
		//判断输入的数字是否可用，及当前数字框的可用状态
		$scope.judge=function(){
			if($scope.disabled) return;
			if(!/^\d+$/.test($scope.num)) $scope.num=$scope.num.replace(/[^\d]/gi,'');
			if($scope.num > $scope.max) $scope.num=$scope.max;
			else if($scope.num < $scope.min) $scope.num=$scope.min;
			$rootScope.$broadcast('numChange', $scope.num);
		}
		function init(){
			$timeout(function(){
				$scope.judge();
			});
		}
		init();
		//当最大与最小数变化时
		$scope.$on("maxChange",function(event,maxnum){
			$scope.max=maxnum;
			//如果最大值是0，则将数字框设置为：不可用，最小值及当前数设置为0
			if(!$scope.max){
				$scope.disabled=true;
				$scope.min=$scope.num=0;
			}
			//如果最大值不是0，且目前为不可用状态，则将数字框设置为可用，最小值及当前数设置为1
			else if($scope.disabled){
				$scope.disabled=false;
				$scope.min=$scope.num=1;
			}
			if($scope.max<$scope.min){
				alert("最小值比最大值大！");
				return false;
			}
			init();
		});
		$scope.$on("minChange",function(event,minnum){
			$scope.min=minnum;
			if($scope.min>$scope.max){
				alert("最小值比最大值大！");
				return false;
			}
			init();
		});
	}]);

	//防止双击选中
	require.async("plugins/refuseSelect",function(refuse){
		$(".NUMBER").find("sub,sup").click(function(event) {
			refuse(this);
		});
	});
	return ;
});
seajs.use('NUMBER');