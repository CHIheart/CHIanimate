/**
 * 顶搜索
 * @authors Your Name (you@example.org)
 * @date    2016-04-25 10:23:27
 * @version $Id$
 */



define('topsearch',[],function(require,exports,module){
	angular.module('TopSearch',[])
	.controller('CtrlTopSearch',['$scope',function($scope){
		$scope.keyword='';
        $scope.judge=function(name){
            return $("#"+name).val() ? 'ng-filled' : 'ng-empty';
        }
        $scope.keywords=[
        	{
        		href:"#",
        		topic:"默认的搜索项目",
        		count:5,
        	}
        ];
	}])
	angular.bootstrap($(".TOPSEARCH"),['TopSearch']);
});
seajs.use('topsearch')