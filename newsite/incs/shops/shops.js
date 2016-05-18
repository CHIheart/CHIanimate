/**
 * 门店大插件
 * @authors Your Name (you@example.org)
 * @date    2016-05-18 09:51:20
 * @version $Id$
 */



define('shops',function(require,exports,module){
	require("../addresses/addresses");
	var SHOPS=require("datas/stores"),
		APP=angular.module('Shops',['Addresses'])
		.controller('CtrlShops', ['$scope', '$timeout',function ($scope, $timeout) {
			//前缀，用来区别三级地址栏的用途（个人收货地址也会使用三级）
			$scope.prefix="SHOP";
			$scope.shops='';
			//根据分数返回星数
			$scope.getStars=function(n){
				return (function(){
					var str=[];
					for(var i=0;i<n;i++) str.push('★');
					return str.join('');
				})();
			}
			//当前页码
			$scope.page=1;
			//根据总数及当前页码返回分页样式
			$scope.getPages=function(){
				return 3;
			}
			//根据店类型返回span类名
			$scope.getClass=function(type){
				switch(type){
					case "快":return "fast";
					case "4S":return "ssss";
					case "修":return "mend";
				}
			}
			//可搜索的项目数组
			$scope.whats=[
				{
					"name":"我的位置",
					"value":"me"
				},{
					"name":"门店名称",
					"value":"name"
				},{
					"name":"门店地址",
					"value":"address"
				}
			];
			//总过滤对象
			$scope.filters={
				what:$scope.whats[0].value,
				province:'',
				city:'',
				district:'',
				services:[],
				key:'',
				lng:0,
				lat:0
			}
		}])
		.filter("fltShops",function(){
			console.log(this);
	        return function(SHOPS,filters){
	        	var shops=[],shop;
	        	for(var n=0;n<SHOPS.length;n++){
	        		shop=SHOPS[n];
	        		if(filters.province && filter.province!=shop.province) continue;
	        		if(filters.city && filter.city!=shop.city) continue;
	        		if(filters.district && filter.district!=shop.district) continue;
	        		shops.push(shop);
	        	}
	        	return shops;
	        }
		});
	//自举要写在所有的控制器都初始化之后
	angular.bootstrap($(".SHOPS"), ['Shops']);
	return ;
});
seajs.use('shops');