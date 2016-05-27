/**
 * 顶搜索，需要注入angular-sanitize
 * @authors Your Name (you@example.org)
 * @date    2016-04-25 10:23:27
 * @version $Id$
 */

define('topsearch',function(require,exports,module){
    var sLastKey='';
	angular.module('Main')
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
        .success(function(data) {
            if(data.result){
                $scope.keywords=data.keys;
                $scope.$apply();
            }else{

            }
        });
	}])
    .filter('fltTopSearch',function(){
        return function(aKeys,sKey,bRemain){
            if(sKey) var output=[];
            angular.forEach(aKeys, function(val,key){
                val.name=val.name.replace(/\<\/?b\>/ig,'');
                if(sKey) if(val.name.indexOf(sKey) >= 0){
                    val.name=val.name.replace(sKey,'<b>'+sKey+'</b>');
                    output.push(val);
                }
            });
            if(!sKey) return aKeys;
            if(output.length==0 && sKey!=sLastKey){
                sLastKey=sKey;
                $.ajax({
                    url: '/ajax/header/getTopKeys',
                    type: 'POST',
                    dataType: 'json',
                    data: {key: sKey},
                })
                .success(function(data) {
                    if(data.result){
                        var scope=angular.element(".TOPSEARCH").scope(),
                            newkeys=data.keys;
                        outer:for(var i=0;i<newkeys.length;i++){
                            for(var j=0;j<aKeys.length;j++){
                                if(aKeys[j].name==newkeys[i].name) break outer;
                            }
                            aKeys.push(newkeys[i]);
                        }
                        scope.$apply();
                    }
                });
            }
            return output;
        }
    });
	// angular.bootstrap($(".TOPSEARCH"),['TopSearch']);
});
seajs.use('topsearch')