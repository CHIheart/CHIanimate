/**
 * 地址三级联动
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:05:22
 * @version $Id$
 */

define('addresses',function(require,exports,module){
	// var x=require("../select/select");
	var CHINA=require("datas/china");
	angular.module('Addresses', [])
		.controller('CtrlAddresses', ['$scope', function ($scope) {
			$scope.prefix="Shop";
			$scope.provinceArray=(function(){
				return $.map(CHINA, function(item, index) {
					return item.parentid=='100000' ? item : null;
				});
			})();
			$scope.province=null;
			$scope.cityArray=null;
			$scope.city=null;
			$scope.districtArray=null;
			$scope.district=null;
			$scope.ids={
				province:0,
				city:0,
				district:0
			};
			$scope.open=function(tar){
				angular.element(tar).addClass('on');
				angular.element(".SELECT:not("+ tar +")").removeClass('on');
			}
			$scope.set=function(item){
				//这个this指向的是每个被repeat出来的子scope，item就是上边的那个显示声明的迭代变量
				$scope[item]=this.item;
				switch(item){
					case 'province':
						$scope.cityArray=(function(){
							return $.map(CHINA, function(item, index) {
								return item.parentid==$scope.province.id ? item : null;
							});
						})();
						$scope.city=null;
						$scope.districtArray=null;
						$scope.district=null;
						break;
					case 'city':
						$scope.districtArray=(function(){
							return $.map(CHINA, function(item, index){
								return item.parentid==$scope.city.id ? item : null;
							});
						})();
						$scope.district=null;
						break;
					default:;
				}
				angular.element("."+item.toUpperCase()).removeClass('on');
			}
		}]);
	angular.bootstrap($(".ADDRESSES"), ["Addresses"])
	return ;
});

seajs.use('addresses');