/**
 * 地址三级联动
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:05:22
 * @version $Id$
 */

define(function(require,exports,module){
	require("../select/select");
	var CHINA=require("datas/china");
	// angular.module('Addresses', [])
	// angular.bootstrap($(".ADDRESSES"), ["Addresses"])
	return function(module){
		module.controller('CtrlAddresses', ['$scope','$timeout', function ($scope,$timeout) {
			$scope.CHINA=CHINA;
			var old={id:"000000"};
			$scope.province=$scope.city=$scope.district=old;
			$scope.set=function(item){
				$scope[item]=this.item;
				switch(item){
					case 'province':
						$scope.city=old;
					case 'city':
						$scope.district=old;
				}
			}
		}]);
	};
});

