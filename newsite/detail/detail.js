/**
 * 详情页
 * @authors Your Name (you@example.org)
 * @date    2016-05-30 11:35:17
 * @version $Id$
 */

define('detail',function(require,exports,module){
	//主选项控制器
	angular.module('Main')
	.controller('CtrlPro', ['$scope','$rootScope', function ($scope,$rootScope) {
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
						$scope.option[opts[m].id]='';
						$scope.options.push(opt);
					}
					!~$.inArray(opts[m].value, opt.values) && opt.values.push(opts[m].value);
				}
			}
		}

		//更换当前产品
		$scope.freshCurpro=function(){
			console.log($scope.option)
		}
	}])
	return ;
});
seajs.use('detail');