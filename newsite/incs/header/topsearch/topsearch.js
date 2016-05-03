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