/**
 * 百度地图原型
 * @authors Your Name (you@example.org)
 * @date    2016-05-20 14:36:14
 * @version $Id$
 */

define(function(require,exports,module){
	var basicSettings={
		//滚轮缩放
		wheelZoom:true,
		//键盘控制
		keyboard:false,
		//拖拽地图
		dragging:true,
		//双击放大
		dbclickZoom:true,
		//比例尺
		scale:true,
		//比例尺位置及单位
		scaleSettings:{
			anchor:BMAP_ANCHOR_BOTTOM_LEFT,
			unit:BMAP_UNIT_IMPERIAL
		},
		//定位导航
		nav:true,
		//定位导航位置、类型、及显示定位
		navSettings:{
			anchor:BMAP_ANCHOR_TOP_LEFT,
			type:BMAP_NAVIGATION_CONTROL_LARGE,
			enableGeolocation: true
		},
		//缩略图
		overview:true,
		//缩略图位置及默认展开
		overviewSettings:{
			anchor:BMAP_ANCHOR_BOTTOM_RIGHT,
			isOpen:true
		},
		//显示多个标记
		multiple:false,
		//是否可编辑（拖拽标记）
		editable:false,
		//是否可按关键字搜索
		searchable:true,
		//移动标记后的回调函数
		onMarkerMoved:$.noop,
		//添加一个标记后的回调函数
		onMarkerAdded:$.noop,
		//删除一个标记后的回调函数
		onMarkerRemoved:$.noop
	};
	function BaiduMap(id,settings){
		if(!document.getElementById(id)){
			alert("百度地图中ID错误："+id);
			return false;
		} 
        this.id=id;
        this.map=new BMap.Map(id);
        //这块必须先执行一次它，不然缩略图就不正常，而且不能使用地名“广州”也会不正常，只能用经纬度
        this.map.centerAndZoom(new BMap.Point(113.280637,23.125178),12);
        var THIS=this,defaultSettings={};
		$.extend(defaultSettings, basicSettings, settings);
		settings=defaultSettings;
		for(var n in settings){
			switch(n){
				case 'wheelZoom':
					settings.wheelZoom && this.map.enableScrollWheelZoom();
					break;
				case 'keyboard':
					settings.keyboard && this.map.enableKeyboard();
					break;
				case 'dragging':
					settings.dragging && this.map.enableDragging();
					break;
				case 'dbclickZoom':
					settings.dbclickZoom && this.map.enableDoubleClickZoom();
					break;
				case 'scale':
					settings.scale && this.map.addControl(new BMap.ScaleControl(settings.scaleSettings));
					break;
				case 'nav':
					settings.nav && this.map.addControl(new BMap.NavigationControl(settings.navSettings));
					break;
				case 'overview':
					settings.overview && this.map.addControl(new BMap.OverviewMapControl(settings.overviewSettings));
					break;
				case 'editable':
					if(settings.editable){
						(function(){
							//多点模式或单点模式且无点时，添加点
							function addMarker(){
								marker=THIS.addMarker(point.lng,point.lat);
					            settings.onMarkerMoved(marker,point.lng,point.lat);
							}
							var marker,
							contextMenus=[
								{
									text:'在此处设置标记',
									callback:function(point){
										if(settings.multiple){
					                        addMarker();
										}else{
											marker=THIS.map.getOverlays();
											if(!markers.length) addMarker;
											else{
												marker=marker[0];
												marker.setPosition(point);
												settings.onMarkerAdded(marker,point.lng,point.lat);
											}
										}
				                    }
								}
							],
							menu = new BMap.ContextMenu();
							for(var i=0; i < contextMenus.length; i++){
				                menu.addItem(new BMap.MenuItem(contextMenus[i].text,contextMenus[i].callback,100));
				            }
							THIS.map.addContextMenu(menu);
						})();
					}
					break;
				case 'searchable':
					if(settings.searchable){
						this.localSearch=new BMap.LocalSearch(this.map, {
			                renderOptions:{map: this.map}
			            });
					}
					break;
				// case '':
				// 	settings. && this.map.();
				// 	break;
			}
		}
		this.settings=settings;
	}
	var markerSettings={
		icon:{
    		image:'marker.png',
    		width:22,
    		height:30,
    		x:0,
    		y:3
		},
		label:{
			x:25,
			y:5,
			title:"新增标记"
		},
		infor:{
			title:'新增标记',
			content:'点击<a>此处</a>以编辑标题及内容',
			width:520
		}
	};
	BaiduMap.prototype={
        //添加一个标记，返回生成的标记，如果是单标记模式，本方法会移动当前标记
        addMarker:function(lng,lat,settings){
        	var defaultSettings={};
            $.extend(defaultSettings, markerSettings, settings);
            settings=defaultSettings;
            var marker = new BMap.Marker(
                new BMap.Point(lng,lat),
                {
                    icon:new BMap.Icon(
                        settings.icon.image,
                        new BMap.Size(settings.icon.width,settings.icon.height),
                        {
                            imageOffset: new BMap.Size(settings.icon.x,settings.icon.y)
                        }
                    ),
                    title:'新增标记，未编辑'
                }
            );
            //添加标签，用来在未展示窗口时显示点名称
            var label=new BMap.Label(
                settings.label.title,
                {
                    offset: new BMap.Size(settings.label.x,settings.label.y)
                }
            );
            marker.setLabel(label);
            marker.label=label;

            //添加信息窗，用来展示大范围的信息
            var inforWin=new BMap.InfoWindow(settings.infor.content,{
            	title: settings.infor.title
            });
            inforWin.setWidth(settings.infor.width);
            marker.inforWin=inforWin;
           
            //如果地图是可编辑的，则点可以拖拽
            if(this.settings.editable)
            {
            	var fun=this.settings.onMarkerMoved;
                marker.enableDragging();
                marker.addEventListener("dragend",function(event){
                    fun(this,event.point.lng,event.point.lat);
                });
				//监听新点，双击时可以编辑信息窗，信息窗格式在同级的文件中
				marker.addEventListener('dblclick',function(){
					this.inforWin.setTitle("信息编辑窗口");
					$.ajax({
						url: './bdmap.html',
						type: 'POST',
						dataType: 'html',
						data: {},
					})
					.success(function(data) {
						this.inforWin.setContent(data);
					});
				});
            }

            //添加点到地图
            //如果是单点编辑，先删除点及它的信息窗及标签
            if(!this.settings.multiple){
            	var overlays=this.map.getOverlays();
            	for(var n=0;n<overlays.length;n++) this.map.removeOverlay(overlays[n]);
            }
            this.map.addOverlay(marker);
            return marker;
        },
		//测量两点距离
        distance:function(lng1,lat1,lng2,lat2){
            var pointA=new BMap.Point(lng1,lat1);
            var pointB=new BMap.Point(lng2,lat2);
            return this.map.getDistance(pointA,pointB);
        },
        //清空地图上的覆盖物
        clear:function(){
            this.map.clearOverlays();
            this.markers=null;
            this.markers=[];
            return this;
        },
        //聚焦到指定位置
        focus:function(lng,lat,zoom){
            !zoom && (zoom=19);
            this.map.centerAndZoom(new BMap.Point(lng,lat),zoom);
            return this;
        },
        //在当前可视区内按关键字搜索地点，并设置回调
        search:function(keyword,callback){
        	if(!$.isFunction(callback)) callback=$.noop;
        	this.localSearch.setMarkersSetCallback(callback);
            this.localSearch.searchInBounds(keyword,this.map.getBounds());
            return this;
        },
        //获取当前打开的信息窗，用来改变显示的内容，没窗打开时返回null
        getInfoWindow: function(){
            return this.map.getInfoWindow();
        }
	}
	return BaiduMap;
});