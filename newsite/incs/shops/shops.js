/**
 * 门店大插件
 * @authors Your Name (you@example.org)
 * @date    2016-05-18 09:51:20
 * @version $Id$
 */

define('shops',function(require,exports,module){
	require("../addresses/addresses");
	require("./services/services");
	var SHOPS=require("datas/stores");
	angular.module('Shops',['Addresses','Services','ngSanitize'])
		//店铺信息过滤器，根据页面所选条件过滤
		.filter("fltShops",function(){
	        return function(SHOPS,filters){
	        	filters.province*=1;
	        	filters.city*=1;
	        	filters.district*=1;
	        	if(!filters.province && !filters.city && !filters.district) return '';
	        	var shops=[],shop,regTag=/\<\/?b\>/ig;
	        	for(var n=0;n<SHOPS.length;n++){
	        		shop=SHOPS[n];
	        		//先省市区过滤
	        		if(filters.province && filters.province!=shop.province) continue;
	        		if(filters.city && filters.city!=shop.city) continue;
	        		if(filters.district && filters.district!=shop.district) continue;
	        		//然后过滤服务
	        		if(filters.services.length){
	        			var ids=','+shop.ids+',',id,match=false;
	        			for(var m=0;m<filters.services.length;m++){
	        				id=','+filters.services[m]+',';
	        				//服务中有一项存在就匹配
	        				if(~ids.indexOf(id)){
	        					match=true;
	        					break;
	        				}
	        			}
	        			//所有服务都不存在的话就下一个
	        			if(!match) continue;
	        		}
	        		//接下来过滤关键字，先清除上一次过滤的关键字标记
	        		shop.nameWithKey=shop.name;
	        		shop.addressWithKey=shop.address;
	        		if(~$.inArray(filters.what, ['name','address']) && filters.key){
	        			if(!~shop[filters.what].indexOf(filters.key)) continue;
	        			shop[filters.what+'WithKey']=shop[filters.what].replace(filters.key,'<b>'+ filters.key +'</b>');
	        		}
	        		//最后过滤经纬度
	        		if(filters.what=='me' && filters.lng && filters.lat){}
	        		shops.push(shop);
	        	}
	        	return shops;
	        }
		})
		//分页控制器
		.controller('CtrlPagination', ['$scope', function ($scope) {
			$scope.pages=[/*{
				num:Number,
				text:String
			}*/];
			$scope.curpage=0;
			$scope.curblock=0;
			var eachpage=5,    //每一块的页码数
				eachinfo=10,   //每一页的信息数
				allpages=0;
			//分页改变时，向上级发送事件，刷新列表
			function change(){
				$scope.$emit("pageChange",$scope.curpage,eachinfo);
			}
			//当上级发送过来数量改变时，重新计算页码
			$scope.$on("amountChange",function(event,allnums){
				allpages=Math.ceil(allnums/eachinfo);
				$scope.curpage=allpages ? 1: 0;
				$scope.curblock=allpages ? 1: 0;
				freshBlock();
				change();
			});
			//刷新页码块
			function freshBlock(){
				$scope.pages=[];
				if(!$scope.curblock) return;
				var begin=($scope.curblock-1) * eachpage+1,
					over=begin + eachpage -1;
				//如果不是从第一块开始
				if(begin!=1) $scope.pages.push({
					num: begin - 5,
					text: '上'+ eachpage +'页'
				});
				for(var n=begin;n<=Math.min(allpages,over);n++){
					$scope.pages.push({
						num: n,
						text: n
					});
				}
				//如果不是处于最后一块
				if(allpages-over>0) $scope.pages.push({
					num: begin + 5,
					text: '下'+ eachpage +'页'
				});
			}
			//设置当前页码，不知道为什么不能写在ng-click上
			$scope.setPage=function(n){
				$scope.curpage=n;
				var over=$scope.curblock * eachpage,
					begin=over- eachpage +1;
				if(n > over || n < begin){
					if(n>over) $scope.curblock++;
					else $scope.curblock--;
					freshBlock();
				}
			}
			//当变更当前页码时，向上发送事件，以更新列表
			$scope.$watch('curpage', function(newValue, oldValue){
				if(newValue!=oldValue) change();
			})
		}])
		//店面信息列表控制器
		.controller('CtrlShops', ['$scope', '$filter',function ($scope, $filter) {
			//前缀，用来区别三级地址栏的用途（个人收货地址也会使用三级）
			$scope.prefix="SHOP";
			$scope.shops='';
			$scope.curShops='';
			//根据分数返回星数
			$scope.getStars=function(n){
				var str=[];
				for(var i=0;i<n;i++) str.push('★');
				return str.join('');
			}
			//当前页码
			$scope.page=1;
			var eachpage=5;
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
			//使用过滤器过滤新数组
			function filter(){
				$scope.shops=$filter('fltShops')(SHOPS ,$scope.filters);
				$scope.$broadcast('amountChange', $scope.shops.length);
			}
			$scope.filter=filter;
			//当三级地址改变时
			$scope.$on('addressesChange',function(event,province,city,district){
				$scope.filters.province=province;
				$scope.filters.city=city;
				$scope.filters.district=district;
				filter();
			});
			//当服务项目改变时
			$scope.$on('servicesChange',function(event,services){
				$scope.filters.services=services;
				filter();
			});
			//当页码变更时，更新列表
			$scope.$on('pageChange', function(event,curpage,eachinfo){
				$scope.curShops=[];
				if(!curpage)return;
				var start=(curpage-1)*eachinfo,
					over=Math.min(start + eachinfo, $scope.shops.length);
				for(var n=start;n<over;n++){
					$scope.curShops.push($scope.shops[n]);
				}
			});
		}])
	//自举要写在所有的控制器都初始化之后
	angular.bootstrap($(".SHOPS"), ['Shops']);
	return ;
});
seajs.use('shops');