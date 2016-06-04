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
		//车总数据
		var ALLCARS;//所有的车型信息
		$scope.brands;//当前显示品牌
		$scope.indices=[];//品牌所有开头字母（按字母表排序）
		$scope.letter='';//当前所显示的品牌的所属标签，为空显示热门，否则为一个字母
		$scope.series;//当前显示车系（二级JSON）
		$scope.outputs;//当前显示排量
		$scope.years;//当前显示出厂年份
		$scope.nums=(function(){//车位码17位
			var a=[];
			for(var n=1;n<=17;n++) a.push(n>10 ? n : '0'+n);
			return a;
		})();
		//当前已选车量信息
		$scope.curcar={
			id:0,//对应我的车库表里的id
			name:"车型名称",
			carTypeId:0,//对应车型预存表里的id
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
			hot:false,//是否热门
			vin:"车位码17位"
		};
		//设置车的数据
		$scope.set=function(item,value){
			$scope.curcar[item]=value;
		}
		//调取完数据后，先整理字母索引
		require.async("datas/cars",function(data){
			ALLCARS=data;
			var bExist;
			for(var letter in ALLCARS){
				$scope.indices.push(letter);
			}
			$scope.showBrands();
		console.log($scope.brands);
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
		$scope.showSeries=function(brandid){
			$scope.series=[];
			
		}
	}])
	return ;
});
seajs.use('CARS');