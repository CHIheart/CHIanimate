//Written by PROCESS.PHP at the time of 2016-05-03 17:54:53
/** 首页头文件碎片使用的js
 */
define('header/index',[],function(require,exports,module){
})
seajs.use('header/index');
/**
 * 顶用户菜单
 */
define('toplinks',[],function(require,exports,module){
	//鼠标指向用户菜单时，菜单下滑
	var oJQ=$(".TOPLINKS").on('mouseenter', '.USERMENU', function(event) {
		$(this).addClass('on').find('dd ul').stop(true).slideDown();
	}).on('mouseleave', '.USERMENU', function(event) {
		$(this).find('dd ul').stop(true).slideUp(function(){
			$(".USERMENU").removeClass('on');
		});
	});

	//根据用户登陆状态来判断显示菜单的哪一部分
	angular.module("TopLinks",[])
		.controller("CtrlTopLinks",['$scope','$timeout',function($scope,$timeout){
			function loginOpen(){
				angular.element(".LOGIN").scope().open();
			}
			$scope.login=function(){
				if(!$(".LOGIN").length)
					$.ajax({
						url: '/ajax/loadPlugin.php',
						type: 'POST',
						dataType: 'html',
						data: {plugin: 'login'},
					})
					.success(function(data) {
						$("body").append(data);
						loginOpen();
					});
				else loginOpen();
			}
			$scope.logout=function(){
				$timeout(function(){
					$scope.online=false;
					$timeout(show,100);
				},100);
			}
		}]);
	angular.bootstrap(oJQ,['TopLinks']);
	
	function show(){
		oJQ.children().css({
			visibility: 'visible'
		})
	}
	show();
	return ;
});
seajs.use('toplinks');
/**
 * 顶购物车的单独应用
 */
define('topcart',[],function(require,exports,module){
	var CONFIRM,ALERT;
	angular.module("TopCart",[])
	.controller('Ctrl_TOPCART',['$scope','$timeout',function($scope,$timeout){
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
		function calculate(){
			$scope.allNums=$scope.allPrice=0;
			for(var n=0; n<carts.length; n++)
			{
				$scope.allNums+=carts[n].num;
				carts[n].pro.price<0 || isNaN($scope.allPrice) ? $scope.allPrice= '待客服报价' : $scope.allPrice+=carts[n].pro.price * carts[n].num;
			}
			!isNaN($scope.allPrice) && ($scope.allPrice+='元');
			!carts.length && (jqNone.show(),jqInfo.add(jqLoad).hide());
		}
		//更新时，先异步获取购物车列表，再重新计算，限制在一次刷新后，再隔3秒才能再刷新，其间只显示已有数据
		var timer,lock=false,
			jqLoad=$(".TOPCARTLOAD"),
			jqInfo=$('.TOPCARTINFO'),
			jqNone=$('.TOPCARTNONE');
		$scope.update=function(){
			if(!lock)
			{
				lock=true;
				jqInfo.hide();
				jqLoad.stop(true,true).slideDown();
				timer=$timeout(function(){
					lock=false;
				},3000);
				$.ajax({
					url: '/ajax/header/topcarts',
					type: 'GET',
					dataType: 'json',
					data: {},
				})
				.success(function(data) {
			    	if(data.result)
			    	{
			    		$timeout(function(){
					    	carts = $scope.carts = data.carts;
					    	open();
					    	calculate();
			    		});
			    	}
			    	else
			    	{}
			    });
			}
			else open();
			function open(){
				jqLoad.hide();
				carts.length ? 
				(
					jqNone.hide(),
					jqInfo.stop(true,true).delay(100).slideDown()
				):(
					jqInfo.hide(),
					jqNone.show()
				)
			}
		}
		//关闭
		$scope.close=function(){
			jqLoad.add(jqInfo).add(jqNone).stop().slideUp();
		}
		//删除一条
		$(".TOPCARTINFO").on('click', 'i.lcz-times', function(event) {
			event.preventDefault();
			var THIS=this,
			getAlert=function(){
				var scopeWinlit=angular.element(".WINLIT").scope();
				CONFIRM=scopeWinlit.confirm;
				ALERT=scopeWinlit.alert;
			},
			delAsk=function(){
				CONFIRM('删除货物','真的要删除这条购物信息吗？','question',function(){
					var li=$(THIS).closest('li'),
						cartid=li.data("cart-id"),
						parentid=li.data('cart-parent-id'),
						delids=[],
						cart;
					for(var n=carts.length-1; n>=0; n--)
					{
						cart=carts[n];
						// 1.当前记录
						// 2.当前记录的附加记录
						(cart.id==cartid || cart.parent==cartid) && (carts.splice(n,1),delids.push(cart.id));
					}
					calculate();
					$scope.$apply();

					$.ajax({
						url: '/ajax/header/cart_delete',
						type: 'POST',
						dataType: 'json',
						data: {ids: delids},
					})
					.success(function(data) {
						if(data.result)
						{
							CONFIRM.close();
						}
						else
						{
							ALERT('删除失败',data.message,'frown');
						}
					});
					li=cart=delids=null;
				});
			};
			!$(".WINLIT").length ? $.ajax({
				url: '/ajax/loadPlugin.php',
				type: 'POST',
				dataType: 'html',
				data: {plugin: 'winlit'}
			})
			.success(function(data) {
				$("body").append(data);
				getAlert();
				delAsk();
			})
			: (!ALERT && getAlert() , delAsk());
			
			$scope.close();
		});
	}]);
	angular.bootstrap($('.TOPCART'), ['TopCart']);
});
seajs.use('topcart');
/**
 * 顶导航
 * @authors Your Name (you@example.org)
 * @date    2016-04-16 15:12:00
 * @version $Id$
 */
define('topcates',[],function(require,exports,module){
	$(".MainCates h3").mouseenter(function() {
		$(".SubCates").eq($(this).index()).removeClass('hide')
			.siblings('.SubCates').addClass('hide');
	});
	$(".CATEGORIES").mouseleave(function(event) {
		$(".SubCates:not(.hide)").addClass('hide');
	});
	return ;
});
seajs.use('topcates');
/**
 * 顶搜索
 * @authors Your Name (you@example.org)
 * @date    2016-04-25 10:23:27
 * @version $Id$
 */

define('topsearch',[],function(require,exports,module){
	angular.module('TopSearch',[])
	.controller('CtrlTopSearch',['$scope','$timeout',function($scope,$timeout){
        $scope.judge=function(name){
            return $("#"+name).val() ? 'ng-filled' : 'ng-empty';
        }
        $.ajax({
            url: '/ajax/header/topkeysdefault',
            type: 'POST',
            dataType: 'json',
            data: {param1: 'value1'},
        })
        .success(function(datas) {
            $scope.keywords=datas;
            $scope.$apply();
        });
	}])
    .filter('fltTopSearch',function(){
        return function(aKeys,sKey,bRemain){
            if(!sKey) return aKeys;
            var output=[];
            angular.forEach(aKeys, function(val,key){
                if(val.name.indexOf(sKey) > 0) output.push(val);
            });
            if(output.length==0){}
            return output;
        }
    });
	angular.bootstrap($(".TOPSEARCH"),['TopSearch']);
});
seajs.use('topsearch')