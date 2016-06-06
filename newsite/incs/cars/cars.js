/**
 * 选择车型
 * @authors Your Name (you@example.org)
 * @date    2016-06-03 10:12:36
 * @version $Id$
 */



define('CARS',function(require,exports,module){
	angular.module('Main')
	.controller('CtrlAllCars', ['$scope', '$timeout', '$rootScope', function($scope,$timeout,$rootScope){
		//接收开启事件
		$scope.$on("startChooseCar",function(event,curcar){
			//如果有指定车型，则将指定车型赋值给各个步骤
			if(curcar){
				;
			}
			$scope.open();
		});
		$scope.open=function(){
			$(".ALLCARS").closest('.FullScreenPlugin').fadeIn();
		}
		$scope.close=function(){
			$(".ALLCARS").closest('.FullScreenPlugin').fadeOut();
		}
		//步骤计数
		$scope.step=1;
		//当前已选车量信息
		$scope.curcar={
			id:0,//对应我的车库表里的id
			name:"车型名称",
			type:0,//对应车型预存表里的id
			brand:0,//品牌id
			brandName:"品牌名称",
			index:"品牌名称首字母",
			logo:"品牌LOGO地址",
			factory:0,//厂商id
			factoryName:"厂商名称",
			sery:0,//车系id
			seryName:"车系名称",
			output:0,//排量
			year:0,//年份
			transmission:"变速箱类型名",
			hot:false,//是否热门
			vin:[]
		};
		//车总数据
		var ALLCARS;//所有的车型信息
		$scope.brands;//当前显示品牌
		$scope.indices=[];//品牌所有开头字母（按字母表排序）
		$scope.letter='';//当前所显示的品牌的所属标签，为空显示热门，否则为一个字母
		$scope.factories;//当前显示厂商
		$scope.series;//当前显示车系
		$scope.outputs;//当前显示排量
		$scope.years;//当前显示出厂年份
		$scope.types;//当前显示的车型
		$scope.nums=(function(){//车位码17位
			var a=[];
			// for(var n=1;n<=17;n++) a.push(n>9 ? n : '0'+n),$scope.curcar.vin.push('');
			for(var n=1;n<=17;n++) a.push(n),$scope.curcar.vin.push('');
			return a;
		})();
		//设置车的数据
		$scope.set=function(item,value){
			if($.isPlainObject(item)){
				for(var n in item){
					$scope.curcar[n]=item[n];
				}
			}else $scope.curcar[item]=value;
		}
		$scope.go=function(n){
			$scope.step=n;
		}
		//调取完数据后，先整理字母索引
		require.async("datas/cars",function(data){
			ALLCARS=data;
			var bExist;
			for(var letter in ALLCARS){
				$scope.indices.push(letter);
			}
			$scope.showBrands();
			$scope.$apply();
		});
		//显示品牌，无参时显示热门，有参数时显示开头字母为参数的品牌
		$scope.showBrands=function(c){
			$scope.letter=c;
			$scope.brands=null;
			if(!!c){
				$scope.brands=ALLCARS[c];
				return true;
			}
			$scope.brands=[];
			for(var letter in ALLCARS){
				var brands=ALLCARS[letter];
				for(var brand in brands){
					if(brands[brand].hot=='1') $scope.brands.push(brands[brand]);
				}
			}
		}
		//显示车系
		$scope.showSeries=function(brand){
			$scope.factories=brand.factories;
			$scope.step=2;
		}
		//显示排量
		$scope.showOutputs=function(sery){
			$scope.outputs=sery.outputs;
			$scope.step=3;
		}
		//显示年份
		$scope.showYears=function(output){
			$scope.years=output.years;
			$scope.step=4;
		}
		//显示车型
		$scope.showTypes=function(year){
			$scope.types=year.types;
			$scope.step=5;
		}
		//输出VIN码时自动下一位
		$scope.nextBit=function(n){
			var input=$("#VIN"+n);
			if(input.hasClass('ng-invalid') || !input.val()) input.select();
			else $("#VIN"+(n+1)).focus();
		}
		//输入VIN码，点击输入框时自动选中
		$scope.select=function(n){
			$("#VIN"+n).select();
		}
		//获取完整的VIN码
		$scope.getVIN=function(){
			return $scope.curcar.vin.join('');
		}
		//整个流程完成
		$scope.finish=function(){
			$.ajax({
				url: '/ajax/cars/add',
				type: 'POST',
				dataType: 'json',
				data: $scope.curcar,
			})
			.success(function(data) {
				if(data.result){
					if($scope.curcar.id){
						//如果是有ID的则为修改车
						$rootScope.$broadcast("finishEditCar", $scope.curcar);
					}else{
						//否则 为新加的车
						$scope.curcar.id=data.id;
						$rootScope.$broadcast("finishAddCar", $scope.curcar);
					}
				}else{
					$rootScope.$broadcast('alert', data.title,data.content,'frown');
				}
			});
		}
	}])
	return ;
});
seajs.use('CARS');