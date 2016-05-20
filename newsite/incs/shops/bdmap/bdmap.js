/**
 * 百度地图
 * @authors Your Name (you@example.org)
 * @date    2016-05-20 09:41:45
 * @version $Id$
 */

define(function(require,exports,module){
	$(window).load(function() {
		var script=$("<script/>");
		script.prop("src","http://api.map.baidu.com/api?v=2.0&ak=QaqY5bsrblkjzUMC22LVGOYZ&callback=init");
		$("body").append(script);
	});
	var callback=$.noop,
		mapid,mymap;
	window.init=function(){
		var BDMAP=require("./prototype.js");
		mymap=new BDMAP(mapid,{
			multiple:true
		});
	}
	angular.module('BaiduMap',[])
		.controller('CtrlBaiduMap', ['$scope', function ($scope) {
			//当地址变更时，聚焦到对应的经纬度上
			$scope.$on("addressChange",function(event,province,city,district){
				var lng,lat;
				for(var n=1; n<arguments.length; n++){
					if(!(arguments[n].id*1)) break;
					lng=arguments[n].lng;
					lat=arguments[n].lat;
				}
				mymap.clear().focus(lng,lat,n*3+1);
			});
			//当搜索“我的位置”时，在当前视区内搜索含有关键字的地点
			$scope.$on("localSearch",function(event,keyword){
				mymap.search(keyword,function(dots){
					for(var n=0;n<dots.length;n++){
						var marker=dots[n].marker;
						marker.addEventListener("infowindowopen",function(event){
							var win=mymap.getInfoWindow(),
	                            point=event.target.point,
	                            content=win.getContent(),
	                            title=win.getTitle();
	                        if(content.indexOf('tfoot')==-1){
	                            content=content.replace('</table>',
	                            	'<tfoot><tr><td colspan="2"><br><a style="color:#3d6dcc;" onclick="SearchNearby('
                            		+ point.lng +','+ point.lat 
                            		+')">在此周边查找门店</a></td></tr></tfoot></table>');
	                            win.setContent(content);
	                            title=title.replace(/\<a target=["']_blank["'][\s\S]+?\<\/a\>/ig,'');
	                            win.setTitle(title);
	                        }
						});
					}
				});
			});
			//当主控制器点击一个店铺时，在地图上显示这个店铺信息
			$scope.$on('findShop', function(event,shop){
				var marker=mymap.addMarker(shop.lng,shop.lat,{
					label:{
						x:25,
						y:5,
						title:shop.name
					}
				});
				marker.addEventListener("inforwindowopen",function(event){
					this.getLabel().hide();
				})
			});
		}]);
	return function(id){
		mapid=id;
	}
});