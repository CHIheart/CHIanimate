/** 首页头文件碎片使用的js
 */



define('header',[],function(require,exports,module){
	//鼠标指向用户菜单时，菜单下滑
	$(".USERMENU").mouseenter(function(event) {
		$(this).addClass('on').find('dd ul').slideDown();
	}).mouseleave(function(event) {
		$(this).find('dd ul').slideUp(function(){
			$(".USERMENU").removeClass('on');
		});
	});

	angular
		.module("HeaderIndex",[])
		.controller('Ctrl_HeaderIndex',function($scope,$timeout,$http){
			//购物车列表
			$scope.carts=[
				// {
				// 	id:1,
				// 	num:2,
				// 	parent:0,
				// 	pro:{
				// 		id:11,
				// 		price:10,
				// 		img:'/srcs/images/pro.png',
				// 		title:'这是产品的名称-红色-大号-家庭装'
				// 	}
				// }
			];
			var carts=$scope.carts;
			$scope.allNums=$('span[ng-bind="allNums"]').text()*1;
			$scope.allPrice=0;
			//更新总数与总价
			function update(){
				$scope.allNums=$scope.allPrice=0;
				for(var n=0; n<carts.length; n++)
				{
					$scope.allNums+=carts[n].num;
					carts[n].pro.price<0 || isNaN($scope.allPrice) ? $scope.allPrice= '待客服报价' : $scope.allPrice+=carts[n].pro.price * carts[n].num;
				}
				!isNaN($scope.allPrice) && ($scope.allPrice+='元');
			}
			//更新时，先异步获取购物车列表，再重新计算，限制在一次刷新后，再隔3秒才能再刷新，其间只显示已有数据
			var timer,lock=false,
				jqLoad=$(".TOPCARTLOAD"),
				jqInfo=$('.TOPCARTINFO');
			$scope.update=function(){
				if(!lock)
				{
					lock=true;
					jqInfo.hide();
					jqLoad.slideDown();
					console.warn('lock on...');
					timer=$timeout(function(){
						lock=false;
						console.log('lock off...');
					},3000);
					$http.get("/virtual_datas/header/topcarts.js")
					    .success(function(response) {
					    	console.info('ajax success!!!!')
					    	carts = $scope.carts = response.carts;
					    	console.log($scope.carts)
					    	open();
					    	update();
					    });
				}
				else open();
				function open(){
					jqLoad.hide();
					jqInfo.delay(100).slideDown();
				}
			}
			//关闭
			$scope.close=function(){
				jqLoad.slideUp();
				jqInfo.slideUp();
			}
		});

	return ;
});

seajs.use('header');