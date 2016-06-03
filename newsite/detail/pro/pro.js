/**
 * 产品部分
 * @authors Your Name (you@example.org)
 * @date    2016-06-03 15:03:42
 * @version $Id$
 */



define('product',function(require,exports,module){
	//主选项控制器
	angular.module('Main')
	.controller('CtrlPro', ['$scope','$rootScope','$timeout', function ($scope,$rootScope,$timeout) {
		$scope.infors={};
		//调用整体信息
		$.ajax({
			url: '/ajax/detail/infors',
			type: 'POST',
			dataType: 'json',
			data: {
				id: $scope.id
			},
		})
		.success(function(data) {
			if(data.result){
				$scope.infors=data;
				tidyOptions();
				$scope.curpro=$scope.infors.pros[0];
				$scope.freshCurpro();
				$scope.$apply();
			}else{
				$rootScope.$broadcast('alert', '数据错误',data.message);
			}
		});
		
		//收藏部分
		$scope.favor=function(){
			var fCallback=function(){
				$.ajax({
					url: '/ajax/list/favor',
					type: 'POST',
					dataType: 'json',
					data: {id: $scope.id},
				})
				.success(function(data) {
					$rootScope.$broadcast('alert',data.title,data.content,'smile');
					$scope.infors.favored=!$scope.infors.favored;
					$scope.$apply();
				});
			};
			if(!$rootScope.online){
				$rootScope.$broadcast('startLogin', fCallback);
			}else fCallback();
		}
		$scope.favorText=function(){
			return $scope.infors.favored ? '已收藏':'未收藏';
		}

		//当前选中的属性值
		$scope.option={};
		//整理属性
		function tidyOptions(){
			var pros=$scope.infors.pros,
				opts,opt;
			$scope.options=[];
			$scope.checked={};
			//当前属性是否已存在于属性列表中
			function existOption(id){
				for(var x=0;x<$scope.options.length;x++){
					if(id==$scope.options[x].id) return $scope.options[x];
				}
				return false;
			}
			for(var n=0;n<pros.length;n++){
				opts=pros[n].options;
				for(var m=0;m<opts.length;m++){
					opt=existOption(opts[m].id);
					if(!opt){
						opt={
							id:opts[m].id,
							name:opts[m].name,
							values:[]
						};
						//向选项列表中塞入数据
						$scope.option[opts[m].id]='';
						$scope.options.push(opt);
						//同时初始化被选项为第一选项
						$scope.checked[opts[m].id]=opts[m].value;
					}
					!~$.inArray(opts[m].value, opt.values) && opt.values.push(opts[m].value);
				}
			}
		}

		//为空时显示的内容
		var pronull={
			"id":0,
			"options":[],
			"price":"无货",
			"price0":'',
			"amount":0,
			"image":"/srcs/images/none.jpg",
			"primary":"/srcs/images/none.jpg"
		};

		//更换当前产品
		$scope.freshCurpro=function(){
			var opts,result,opt;
			//必须放在这里，不然数据总是显示前一次的数据，更新慢一拍
			$timeout(function(){
				//统计当前选择的是哪个产品，把指针指向它
				for(var n=0; n<$scope.infors.pros.length; n++){
					opts=$scope.infors.pros[n].options;
					result=true;
					for(var x in opts){
						opt=opts[x]
						if(opt.value!=$scope.checked[opt.id]){
							result=false;
							break;
						}
					}
					if(result){
						$scope.curpro=$scope.infors.pros[n];
						break;
					}
				}
				if(!result){
					$scope.curpro=pronull;
				}
				//改变产品大图
				$(".LargePhoto img").attr({
					"src": $scope.curpro.image,
					"data-primary": $scope.curpro.primary
				}).data({
					"primary": $scope.curpro.primary
				});
				//发送产品更新事件
				$rootScope.$broadcast("maxChange", $scope.curpro.amount);
				$rootScope.$broadcast("proChange", $scope.curpro);
			});
		}

		//开启登录
		$scope.startLogin=function(){
			$rootScope.$broadcast('startLogin');
		}

		//接收到登陆成功事件后，如果需要匹配车，则调出车库列表
		$scope.$on("loginOK",function(event){
			if(!$scope.needCar) return;
			$.ajax({
				url: '/ajax/detail/cars',
				type: 'POST',
				dataType: 'json',
				data: {},
			})
			.success(function(data) {
				if(data.result){
					$scope.cars=data.cars;
					$scope.$apply();
				}else{
					$rootScope.$broadcast('alert', '数据错误',data.message);
				}
			});
		});

		//点击选择车型
		$scope.chooseCar=function(){
			$rootScope.$broadcast('startChooseCar',null);
		}
	}])
	return ;
});

seajs.use("product");