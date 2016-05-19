/**
 * 地址三级联动
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:05:22
 * @version $Id$
 */

define(function(require,exports,module){
	require("../select/select");
	var CHINA=require("datas/china");
	angular.module('Addresses', [])
		.controller('CtrlAddresses', ['$scope',function ($scope) {
			$scope.CHINA=CHINA;
			//默认让省市区都指过来，因为如果过滤条件为空的话，选项会全显示出来
			var old={id:"000000"};
			$scope.province=$scope.city=$scope.district=old;
			$scope.set=function(item){
				$scope[item]=this.item || old;
				switch(item){
					case 'province':
						$scope.city=old;
					case 'city':
						$scope.district=old;
				}
				$scope.$emit('addressesChange', $scope.province.id,$scope.city.id,$scope.district.id);
			}
		}]);
});
