/**
 * 过滤器-服务项目
 * @authors Your Name (you@example.org)
 * @date    2016-05-19 10:23:20
 * @version $Id$
 */

define(function(require,exports,module){
	$(".Services span").click(function(event) {
		$(this).toggleClass('checked');
	});
	angular.module('Services', [])
		.controller('CtrlServices', ['$scope', function ($scope) {
			$scope.change=function(){
				var ids=$(".Services span.checked").map(function(){
					return $(this).data("id");
				}).get();
				$scope.$emit('servicesChange', ids);
			}
		}])
	return ;
});
