/**
 * 产品列表页
 * @authors Your Name (you@example.org)
 * @date    2016-05-24 14:02:35
 * @version $Id$
 */

define('pros',function(require,exports,module){
	//百度分享
	require.async("plugins/bdshare");
	window._bd_share_config = {
		common : {
			bdText : '自定义分享内容',	
			bdDesc : '自定义分享摘要',	
			bdUrl : '自定义分享url地址', 	
			bdPic : '自定义分享图片',
			onBeforeClick : function(cmd,config){
				//百度分享的内容不会自动更新，所以要临时手动改
				config.bdDesc='';
				config.bdPic=window._bd_share_config.common.bdPic;
				config.bdText=window._bd_share_config.common.bdText;
				config.bdUrl=window._bd_share_config.common.bdUrl;
				return config;
			}
		},
		share : [{
			"bdSize" : 16
		}],
		slide : false,
		image : false,
		selectShare : false
	}


	//超过5个缩略图的，生成电影滚动特效
	require.async("effects/movie",function(CHImovie){
		$(".Main .thumbs").each(function(index, el) {
			var lis=$(this).find("li"),
				sub=$(this).find("sub"),
				sup=$(this).find("sup");
			if(lis.length>5){
				var movie=CHImovie($(this).find("div"),"ol",{
					prev: sub,
					next: sup
				},{
					minLi:5,
					auto: false
				},{
					move:function(aim){
						//必须得用trigger，不能用click
						aim.trigger('click',[true]);
					}
				});
				$(this).data('movie',movie);
			}
			else{
				sub.add(sup).remove();
				lis.eq(0).click();
			}
		})
		//点击缩略图，更换大图信息（所有信息）
		.find("li").on('click',function(event,bFromMovie) {
			if(!bFromMovie){
				var movie=$(this).closest('.thumbs').data('movie');
				if(movie){
					movie.show($(this).index());
				}
			}
			$(this).addClass('cur').siblings().removeClass('cur');
			var img=$(this).find("img"),
				signs=img.data('signs'),
				photo=img.data('photo'),
				href=img.data('href'),
				cart=img.data('cart'),
				price=img.data('price'),
				price0=img.data('price0'),
				par=$(this).parentsUntil("ul.PROLIST").last(),
				topic=par.find("h3 a").text();
			par.find("var img").prop("src",photo).end()
				.find(".prices").html('<ins>'+ price +'元</ins>'+(price0 && ' <del>'+price0+'元</del>')).end()
				.find(".actions .cart a").prop("href",cart).end()
				.find("blockquote").html(function(){
					var aSigns=signs.split(";"),str=[];
					for(var n=0; n<aSigns.length; n++){
						var sign=aSigns[n].split(':');
						str.push('<abbr class="', sign[0] ,'">', sign[1] ,'</abbr> ');
					}
					return str.join('');
				});
			var conf=window._bd_share_config.common;
			conf.bdText=topic;
			conf.bdUrl=href;
			conf.bdPic=photo;
		})
		.filter(":first-child").click();
	});

	//产品收藏控制器
	angular.module('Main')
		.controller('CtrlFavors', ['$scope','$timeout','$rootScope', function ($scope, $timeout, $rootScope) {
			$scope.favors='';
			//如果是登录状态的话，就获取当前用户收藏了的产品ID列表
			$scope.$on('loginOK',function(event){
				$.ajax({
					url: '/ajax/list/favors',
					type: 'POST',
					dataType: 'json',
					data: {},
				})
				.success(function(data) {
					if(data.result){
						$scope.favors=data.ids;
						$scope.$apply();
					}else{
						$rootScope.$broadcast('alert','操作失败',data.message,'frown');
					}
				});
			});
			//接收登出事件
			$scope.$on('logout',function(){
				$scope.favors='';
			});
			//某个产品是否被收藏过
			$scope.favored=function(id){
				return !!~$.inArray(id, $scope.favors);
			}
			//收藏某个产品，必须先登录
			$scope.favor=function(id){
				var fCallback=function(){
					$.ajax({
						url: '/ajax/list/favor',
						type: 'POST',
						dataType: 'json',
						data: {
							id: id
						},
					})
					.success(function(data) {
						$rootScope.$broadcast('alert',data.title,data.content,'smile');
						$scope.favors=data.favors;
						$scope.$apply();
					});
				}
				if(!$rootScope.online){
					$rootScope.$broadcast('startLogin',fCallback);
				}else{
					fCallback();
				}
			}
		}]);
	return ;
});
seajs.use('pros');