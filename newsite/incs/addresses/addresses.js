/**
 * 地址三级联动
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:05:22
 * @version $Id$
 */

define('addresses',function(require,exports,module){
	angular.module('Main')
		.controller('CtrlAddresses', ['$scope','$rootScope',function ($scope,$rootScope) {
			//这块必须异步调用，不然会卡住进程，就会报错
			require.async("/incs/select/select");
			require.async("datas/china",function(data){
				$scope.CHINA=data;
				$scope.$apply();
			});
			//默认让省市区都指过来，因为如果过滤条件为空的话，选项会全显示出来
			var old={id:"000000"};
			$scope.prefix="shop"
			$scope.province=$scope.city=$scope.district=old;
			$scope.set=function(item){
				$scope[item]=this.item || old;
				switch(item){
					case 'province':
						$scope.city=old;
					case 'city':
						$scope.district=old;
				}
				//向上发送地址更改事件
				$rootScope.$broadcast('addressesChange', $scope.province,$scope.city,$scope.district);
			}
		}]);
});

seajs.use('addresses');
