/**
 * 保留原版的全局函数，压缩版的在永恒库里边
 * @authors Your Name (you@example.org)
 * @date    2016-05-13 14:33:40
 * @version $Id$
 */

define('always',function(require,exports,module){
	// 自己编写的lazyload，只对img[data-src]有效
	var imgs = $("img[data-src]").css("opacity",0);
	$(window).on("scroll load resize", function() {
		var scroll = $(this).scrollTop();
		imgs = $.grep(imgs, function(ele, ind) {
			var top = $(ele).offset().top,
				height = $(ele).outerHeight(),
				winh = $(window).height();
			if(top<=scroll + winh && top + height >=scroll){
				$(ele).attr("src",$(ele).data("src")).load(function(){$(this).animate({opacity:1})});
				if(ele.complete) $(ele).animate({opacity:1});
				return false;
			}
			return true;
		})
	});
	//自己编写的调用插件过程
	// function loadPlugin(name,done,init){
	// 	!$.isFunction(done) && (done=$.noop);
	// 	!$.isFunction(init) && (init=$.noop);
	// 	if(!$("."+name.toUpperCase()).length){
	// 		$.ajax({
	// 			url: '/ajax/loadPlugin.php',
	// 			type: 'POST',
	// 			dataType: 'html',
	// 			data: {plugin: name},
	// 		})
	// 		.success(function(data) {
	// 			var style=data.match(/<style>[\s\S]*?<\/style>/gi)[0],
	// 				script=data.match(/<script>[\s\S]*?<\/script>/gi)[0],
	// 				html=data.replace(style,'').replace(script,'');
	// 			$('body').append(style+script);
	// 			var $injector = angular.injector(['ng', 'Main']);
	// 			$injector.invoke(function($rootScope, $compile) {
	// 				$('body').append($compile(html)($rootScope));
	// 			});
	// 			// $("body").append(data);
	// 			done();
	// 			init();
	// 		});
	// 	}else done();
	// }
	// window.loadPlugin=loadPlugin;
	//生成主模块
	angular.module('Main',['ngSanitize'])
		.controller('CtrlMain', ['$scope', function ($scope) {
		}]);
	//单复选框，IE8兼容
	if(navigator.userAgent.indexOf('MSIE 8')>0)
	$(".BOXGROUP").on('click', 'label', function(event) {
		var box=$(this).prev(":checkbox").get(0);
		box.checked=!box.checked;
		$(box).change();
	});
	require.async("plugins/refuseSelect",function(refuse){
		$(".BOXGROUP").on('click', 'label', function(event) {
			refuse(this);
		});
	});
	return ;
});

seajs.use('always');