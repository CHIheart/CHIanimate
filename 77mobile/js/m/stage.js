//二维坐标系
function CHIxySystem(id)
{
	if(!$("#"+id))return false;
	this.id=id;
	this.stage=$("#"+id);
	this.size={w:this.stage.width(),h:this.stage.height()};
	this.append=function(JQobj){this.stage.append(JQobj);}
	///////
	this.center={x:0,y:0};
	this.x_axis=$("<div/>");
	this.x_axis.get(0).id=this.id + '_x_axis';
	this.x_axis.css({
		width:"100%"
		,height:"1px"
		,backgroundColor:'#ccc'
		,fontSize:"0px"
		,left:"0px"
	}).hide();
	this.append(this.x_axis);
	///////
	this.y_axis=$("<div/>");
	this.y_axis.get(0).id=this.id + '_y_axis';
	this.y_axis.css({
		width:"1px"
		,height:"100%"
		,backgroundColor:'#ccc'
		,fontSize:"0px"
		,top:"0px"
	}).hide();
	this.append(this.y_axis);
	///////
	this.minX=this.maxX=this.minY=this.maxY=0;
	this.setCenter=function(left,top){
		this.center.x=left || this.size.w/2;
		this.center.y=top || this.size.h/2;
		this.maxX=this.size.w - this.center.x;
		this.minX=0 - this.center.x;
		this.maxY=this.center.y;
		this.minY=this.center.y - this.size.h;
		//x，y轴
		this.x_axis.css("top",this.center.y+"px");
		this.y_axis.css("left",this.center.x+"px");
	}
	this.drawPoint=function(p,container,color){
		if(!isPoint(p) || !this.hasPoint(p))return false;
		if(!color)color='black';
		var d=$("<div/>");
		d.addClass("point");
		d.x=p.x;d.y=p.y;
		if(!container)//在场景里画点需要用相对
		{
			this.append(d);
			if(!p.left) p=this.getPosition(p);
			d.css({
				left:p.left + 'px'
				,top:p.top + 'px'
				,backgroundColor:color
			});
		}
		else//在容器里使用绝对，以减少误差
		{
			container.append(d);
			d.css({
				left:p.x + 'px'
				,top:p.y + 'px'
				,backgroundColor:color
			});
		}
	}
	this.getPosition=function(p){
		if(!isPoint(p))return false;
		p.left= this.center.x + p.x;
		p.top=this.center.y - p.y;
		return p;
	}
	this.delShape=function(obj){
		$("#CHI_canvas_of_"+obj.id).remove();
	}
	//以线性值画图形，目前只支持直线、抛物线、圆、椭圆、双曲线
	this.drawLinear=function(obj,color){
		if(!color)color='#000';
		var xFrom,xTo;
		var shapeDiv=$("<div/>").addClass("shape").css({
			left: this.center.x + 'px'
			,top: this.center.y + 'px'
		});
		shapeDiv.get(0).id="CHI_canvas_of_"+obj.id;
		this.append(shapeDiv);
		switch(obj.shape)
		{
			case "LINE":
				if(!obj.a || !obj.b)
				{
					var l=$("<div/>");
					l.css('backgroundColor',color);
					if(!obj.a)//横线
					{
						var p={
							x:0
							,y:-1 * obj.c / obj.b
						};
						p=this.getPosition(p);
						l.css({
							width:'100%'
							,height:'1px'
							,top:p.top + 'px'
						});
					}
					else//竖线
					{
						var p={
							x:-1 * obj.c / obj.a
							,y:0
						};
						p=this.getPosition(p);
						l.css({
							width:'1px'
							,height:'100%'
							,left:p.left + 'px'
						});
					}
					shapeDiv.append(l);
					return true;
				}
				xFrom=this.minX;
				xTo=this.maxX;
				break;
			case "PARABOLA":
			case "ABS":
			case "SIN":
			case "ABSIN":
				xFrom=this.minX;
				xTo=this.maxX;
				break;
			case "CIRCLE":
				xFrom=Math.max(this.minX , obj.cp.x - obj.r);
				xTo=Math.min(this.maxX, obj.cp.x + obj.r);
				break;
			case "ELLIPSE":
			case "HYPERBOLA":
				xFrom=obj.a*-1;
				xTo=obj.a;
				break;
			default: return false;
		}
		for(var x=xFrom;x<=xTo;x++)
		{
			var y=obj.getY(x);
			if(y==undefined);
			else if(typeof y !='object') this.drawPoint({x:x,y:y},shapeDiv,color);
			else
			{
				var y1=y[0],y2=y[1];
				this.drawPoint({x:x,y:y1},shapeDiv,color);
				this.drawPoint({x:x,y:y2},shapeDiv,color);
			}
		}
	}
	//以角度画图形
	this.drawTheta=function(obj,color,rounds){
		if(!(obj instanceof CHIshape))return false;
		var tFrom,tTo;
		var shapeDiv=$("<div/>").addClass("shape").css({
			left: this.center.x + 'px'
			,top: this.center.y + 'px'
		});
		shapeDiv.get(0).id="CHI_canvas_of_"+obj.id;
		this.append(shapeDiv);
		switch(obj.shape)
		{
			case "CIRCLE":
			case "CIRCLE_SKEWED":
			case "CIRCLE_SCALED":
			case "ELLIPSE":
			case "HYPERBOLA":
			case "HEARTH":
			case "HEARTH":
			case "FOLIUM":
			case "PARACYCLE":
			case "ROSE":
			case "LISSA":
				tFrom=0;tTo=359;
				break;
			case "SPIRAL":
			case "CYCLOID":
				if(!rounds)rounds=5;
				tFrom=0;tTo=rounds*360-1;
				break;
			default: return false;
		}
		for(var t=tFrom;t<=tTo;t++)
		{
			var p=obj.getPoint(t);
			if(p==undefined);
			else this.drawPoint(p,shapeDiv,color);
		}
	}
	this.axis=function(b){
		if(b)
		{
			this.x_axis.show();
			this.y_axis.show();
		}
		else
		{
			this.x_axis.hide();
			this.y_axis.hide();
		}
	}
	this.hasPoint=function(p){
		if(!isPoint(p))return false;
		if(p.x>this.maxX || p.x<this.minX || p.y>this.maxY || p.y<this.minY)return false;
		return true;
	}
	this.clear=function(){this.stage.empty();}
	this.setCenter();
}
//二维舞台
function CHIstage(DOMid)
{
	if(!$("#"+DOMid))return false;
	var stage=new CHIxySystem(DOMid);
	stage.onStage=function(JQobj){
		if(JQobj.onStage) return false;
		JQobj.onStage=true;
		stage.append(JQobj);
		JQobj.css({
			left:JQobj.width * -1 + 'px'
			,top:JQobj.height * -1 + 'px'
		});
	}
	stage.set=function(JQobj,p,hAlign,vAlign){
		if(!JQobj.onStage)stage.onStage(JQobj);
		if(!isPoint(p)) p={x:0,y:0};
		JQobj.point=p;
		var ow=JQobj.width(),oh=JQobj.height();
		p= this.getPosition(p);
		var top=p.top,left=p.left;
		if(!hAlign) hAlign="center";
		if(!vAlign) vAlign="center";
		switch(hAlign)
		{
			case "left": break;
			case "right": left-=ow; break;
			case "center": left-=ow/2; break;
			default:
				if(hAlign.match("\%")) left-=ow * parseFloat(hAlign) * 0.01;
				else if(hAlign.match("px")) left-= parseFloat(hAlign);
		}
		switch(vAlign)
		{
			case "top": break;
			case "bottom": top-=oh; break;
			case "center": top-=oh/2; break;
			default:
				if(vAlign.match("\%")) top-=oh * parseFloat(vAlign) * 0.01;
				else if(vAlign.match("px")) top-= parseFloat(vAlign);
		}
		JQobj.css({
			left:left + 'px'
			,top:top + 'px'
		});
	}
	function getLen(JQobjs){return JQobjs.constructor==Array ? JQobjs.length : JQobjs.size();}
	function getObj(JQobjs,cnt){
		var isArr=JQobjs.constructor==Array;
		var l=isArr? JQobjs.length : JQobjs.size();
		if(l<cnt)return null;
		return isArr ? JQobjs[cnt] : JQobjs.eq(cnt);
	}
	stage.sets=function(JQobjs,p,hAlign,vAlign){
		for(var n=0;n<getLen(JQobjs);n++)
			stage.set(getObj(JQobjs,n),p,hAlign,vAlign);
	}
	/*
	渐变式直线移动效果
	cbfuns.step，每置放一次的回调函数
	cbfuns.over，完成放置动作的回调函数
	*/
	stage.move=function(JQobj,point,step,settings,cbfuns){
		if(!JQobj.size() || !isPoint(point))return false;
		if(!settings)settings={};
		if(!step)step=10;
		var speed=settings.speed?settings.speed:30;
		var x1=JQobj.point.x,y1=JQobj.point.y
			,x2=point.x,y2=point.y
			,dx=(x2-x1)/step
			,dy=(y2-y1)/step;
		var n=1;
		
		JQobj.timer=setInterval(function(){
			stage.set(JQobj,{x:x1 + dx*n,y:y1 + dy*n});
			if(cbfuns && cbfuns.step) cbfuns.step();
			n++;
			if(n>step)
			{
				clearInterval(JQobj.timer);
				JQobj.timer=0;
				if(cbfuns && cbfuns.over) cbfuns.over();
			}
		},speed);
	}
	/*
	渐变式函数移动效果
	其中from和to，直线及抛物线时使用x坐标，圆使用角度值
	cbfuns.step，每置放一次的回调函数
	cbfuns.over，完成全部动作的回调函数
	cbfuns.replays，每次执行回放之前的函数，可以是数组
	*/
	stage.animate=function(JQobj,shape,from,to,step,settings,cbfuns){
		if(!JQobj || !shape) return false;
		if(!settings)settings={}
		if((shape instanceof CHIline) || (shape instanceof CHIparabola) || (shape instanceof CHIhyperbola) || (shape instanceof CHIspiral))
		{
			if(from==undefined)from=stage.minX;
			if(to==undefined)to=stage.maxX;
		}
		else if((shape instanceof CHIellipse) || (shape instanceof CHIcircle))
		{
			if(from==undefined)from=0;
			if(to==undefined)to=360;
		}
		else return false;
		
		if(!JQobj.onStage)stage.onStage(JQobj);
		if(!step) step=10;
		if(!settings.speed) settings.speed=30;
		if((settings.redo || settings.rewind) && !settings.reDelay) settings.reDelay=3000;
		if(JQobj.timer)clearTimeout(JQobj.timer);
		if(!("cur" in JQobj))JQobj.cur=from;
		stage.set(JQobj,shape.getPoint(JQobj.cur));
		if(cbfuns && cbfuns.step) cbfuns.step();
		
		var speed=settings.speed,
			reDelay=settings.reDelay
			delta=(to-from)/step;
		
		if(settings.redo) var redo=settings.redo;
		if(settings.rewind) var rewind=settings.rewind;
		
		var needGO=delta>0 && JQobj.cur<to  ||  delta<0 && JQobj.cur>to;
		var needRW=JQobj.rewind || !("rewind" in JQobj) && rewind;
		var needRD=JQobj.redo || !("redo" in JQobj) && redo;
		
		if(needGO)
		{
			var next=JQobj.cur + delta;
			JQobj.cur=delta>0?Math.min(next,to):Math.max(next,to);
			JQobj.timer=setTimeout(function(){
				stage.animate(JQobj,shape,from,to,step,settings);
			},speed);
		}
		else if(needRW || needRD)
		{
			if(cbfuns && cbfuns.replays)
			{//这里是没经过测试的……
				var funs=cbfuns.replays;
				if(typeof funs =='function') funs();
				else
				{
					var cnt;
					if("rewind" in JQobj) cnt=JQobj.rewind;
					else if("redo" in JQobj) cnt=JQobj.redo;
					else cnt=rewind || redo;
					if(cnt<funs.length) funs[cnt]();
				}
			}
			if(needRW)
			{
				if(!("rewind" in JQobj))JQobj.rewind=rewind;
				JQobj.cur=to;
				JQobj.timer=setTimeout(function(){
					stage.animate(JQobj,shape,to,from,step,settings);
				},reDelay);
				JQobj.rewind--;
			}
			else
			{
				if(!("redo" in JQobj))JQobj.redo=redo;
				JQobj.cur=from;
				JQobj.timer=setTimeout(function(){
					stage.animate(JQobj,shape,from,to,step,settings);
				},reDelay);
				JQobj.redo--;
			}
		}
		else if(cbfuns && cbfuns.over)cbfuns.over();
	}
	//批量执行的说明与单次的相同，delay为每个DOM间隔的时间
	stage.animates=function(JQobjs,shape,from,to,step,settings,cbfuns){
		if(!settings)settings={}
		var delay=settings.delay?settings.delay:1000;
		var cnt=0;
		var l=getLen(JQobjs)
		var w=setInterval(function(){
			stage.animate(getObj(JQobjs,cnt),shape,from,to,step,settings,cbfuns);
			cnt++;
			if(cnt==l) {clearInterval(w); w=0;}
		}, delay);
	}
	/*
	均匀分散排列，可用于直线（from、to使用x坐标），圆（from、to使用角度值）
	参数animate为真时使用动画，由参数setting设置，不使用动画则忽略settings
	settings可以使用的键有：
		delay，每个单元与下一个单元开始动画时的间隔
		speed，每个单元动画进行的统一速度
	*/
	stage.spread=function(JQobjs,shape,from,to,step,animate,settings){
		var fun;
		if(!(shape instanceof CHIline) && !(shape instanceof CHIcircle)) return false;
		if(!settings)settings={}
		
		var num=getLen(JQobjs)-1,
			delta=(to-from)/num,
			delay=settings.delay?settings.delay:500,
			speed=settings.speed?settings.speed:30,
			reverse=settings.reverse?true:false,
			point=settings.point?settings.point:null
		;
		
		if(!step)step=10;
		if(animate)
		{
			if(point)//起始点径直移动效果
			{
				for(var i=0;i<=num;i++) stage.set(getObj(JQobjs,i),point);
				var cnt=0;
				var w=setInterval(function(){
					var n=reverse?cnt : num-cnt;
					var pg=shape.getPoint(from + delta * n);
					stage.move(getObj(JQobjs,cnt),pg,step,{speed:speed});
					cnt++;
					if(cnt>num) {clearInterval(w); w=0;}
				},delay);
			}
			else//函数移动效果
			{
				var cnt=0;
				var w=setInterval(function(){
					var n=reverse?cnt : num-cnt;
					stage.animate(getObj(JQobjs,cnt),shape,from,from + delta * n,step,{speed:speed});
					cnt++;
					if(cnt>num) {clearInterval(w); w=0;}
				},delay);
			}
		}
		else//直接定位效果
		{
			for(var n=0;n<JQobjs.size();n++)
			{
				var x=from + delta * (reverse?n:(num-n))
				var p=shape.getPoint(x);
				stage.set(getObj(JQobjs,n),p);
			}
		}
	}
	//只应用于圆的效果，step是每次转动的角度，为正是顺时针，负是逆时针
	stage.rounds=function(JQobjs,circle,startAngle,step,settings){
		if(!settings)settings={};
		if(!startAngle)startAngle=180;
		if(!step)step=1;
		if(!(circle instanceof CHIcircle))return false;
		var speed=settings.speed?settings.speed:30;
		var dir=Math.abs(step)/step;
		var l=getLen(JQobjs);
		var delta=360/l;
		for(var n=0;n<l;n++)
		{
			var o=getObj(JQobjs,n);
			var a=new Number(startAngle + delta * dir * n);
			o.angle=a.toFixed(2);
			stage.set(o,circle.getPoint(o.angle));
			if(n)o.hide();
		}
		var p0=circle.getPoint(startAngle);
		
		var roundTimer=setInterval(function(){
			for(var n=0;n<l;n++)
			{
				var o=getObj(JQobjs,n);
				var a=new Number(o.angle-step);
				o.angle=a.toFixed(2);
				var p=circle.getPoint(o.angle);
				if((o.angle-startAngle)%360==0) o.show();
				stage.set(o,p);
			}
		},speed);
	}
	return stage;
}
