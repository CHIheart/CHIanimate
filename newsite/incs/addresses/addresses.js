/**
 * 地址三级联动
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:05:22
 * @version $Id$
 */

define('addresses',function(require,exports,module){
	var x=require("../select/select");
	console.log(x);
	console.info(require.resolve("../select/select"))
	var CHINA=require("datas/china");
	angular.module('Addresses', [])
		.controller('CtrlAddresses', ['$scope','$timeout', function ($scope,$timeout) {
			$scope.provinces=(function(){
				return $.map(CHINA, function(item, index) {
					return item.parentid=='100000' ? item : null;
				});
			})();
		}]);
	angular.bootstrap($(".ADDRESSES"), ["Addresses"])
	return ;
});

seajs.use('addresses');