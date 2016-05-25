/**
 * 产品列表页
 * @authors Your Name (you@example.org)
 * @date    2016-05-24 14:02:35
 * @version $Id$
 */

define('pros',function(require,exports,module){
	//百度分享
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


	var CHImovie=require("effects/movie");
	//超过5个缩略图的，生成电影滚动特效
	$(".Main .thumbs").each(function(index, el) {
		var lis=$(this).find("li"),
			sub=$(this).find("sub"),
			sup=$(this).find("sup");
		if(lis.length>5){
			CHImovie($(this).find("div"),"ol",{
				prev: sub,
				next: sup
			},{
				minLi:5,
				auto: false
			},{
				move:function(aim){
					aim.click();
				}
			});
		}
		else{
			sub.add(sup).remove();
			lis.eq(0).click();
		}
	})
	//点击缩略图，更换大图信息（所有信息）
	.find("li").click(function(event) {
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

	//产品收藏控制器
	angular.module('Favors', [])
		.controller('CtrlFavors', ['$scope','$timeout', function ($scope, $timeout) {
			var scope=angular.element('.TOPLINKS').scope();
			$scope.favors='';
			$scope.status=scope;
			//如果是登录状态的话，就获取当前用户收藏了的产品ID列表
			$scope.$watch('status.online', function(newvalue,oldvalue){
				console.log("status.online changed",newvalue,oldvalue)
				if(!!newvalue){
					$.ajax({
						url: '/ajax/list/favors',
						type: 'POST',
						dataType: 'json',
						data: {},
					})
					.success(function(data) {
						if(data){
							$timeout(function(){
								$scope.favors=data.ids.split(',');
							});
						}else{
							ALERT(data.title,data.content,'frown');
						}
					});
				}else{
					$scope.favors='';
				}
			});
			//某个产品是否被收藏过
			$scope.favored=function(id){
				console.log(id);
				return !!~$.inArray(id.toString(), $scope.favors);
			}
			//收藏某个产品，必须先登录
			$scope.favor=function(id){
				if(!scope.online){
					scope.login(function(){
						$scope.favor(id);
					});
				}else{
					$.ajax({
						url: '/ajax/list/favor',
						type: 'POST',
						dataType: 'json',
						data: {
							id: id
						},
					})
					.success(function(data) {
						//必须写，不然watch不到
						$scope.$digest();
						ALERT(data.title,data.content,'smile');
					});
				}
			}
		}]);
	angular.bootstrap($(".Main .PROLIST"), ['Favors']);
	return ;
});
seajs.use('pros');