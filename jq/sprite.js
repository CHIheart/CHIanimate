//扩展JQ元素的visible/hidden方法，及sprite
define(function(require,exports,module){
	$.fn.visible=function(){return this.css('visibility','visible');}
	$.fn.hidden=function(){return this.css('visibility','hidden');}
	/*
	在一个元素上生成精灵图播放功能
	参数setFuns是事件函数集合对象，可以使用的属性有
		loaded(counter)，所有图片资源调用完成之后调用，参数counter为计数器，此时为总图片量
		loading(counter,allnum)，每个图片资源调用完成之后调用，参数counter为计数器，allnum为总图片量
		show/hide(n)，在显示/隐藏第n张图片时候调用
		loop(n)，在循环播放时调用，n为剩余的循环次数
		stop()，在停止播放时调用，用以处理播放完成时的行为
	生成的对象是控制播放的功能对象，可以使用的属性有
		loaded，布尔值，指fill命令所填充的图片资源是否全部调用完成
		step，正整数，播放步长，所有图片是每隔几个播放一次
		at，正整数，当前处于第几帧
		fill(srcPattern,maxnum,delta)，填充图片，会先将容器清空，其中参数
			srcPattern，必需，路径格式串，里边必须含有字符串{n}，用以替换成整数，图片的文件名最好使用方便的连续的数字为名
			maxnum，必需，最大数字，超过最大数字就停止填充
			delta，取图间隔值，默认为1，即每张图都取，可以是正整数，或一个函数
				*****函数接受两个参数，当前数及最大数，可以使用函数创造衰减的间隔值
		play/rewind(speed,loop)，正向/反向播放全图，其中参数
			speed，每张图间隔的毫秒数，默认为50
			loop，布尔值，是否循环播放，默认为0，可以为正整数，为-1时无限循环
	*/
	$.fn.sprite=function(setFuns){
		var THIS=this,
			funs=$.extend({
				loaded:$.noop,
				loading:$.noop,
				show:$.noop,
				hide:$.noop,
				loop:$.noop,
				stop:$.stop
			}, setFuns),
			timer
		;
		return {
			loaded:false,
			step:1,
			at:0,
			fill:function(srcPattern,maxnum,delta){
				if(isNaN(maxnum) || maxnum<=0) return false;
				THIS.empty();
				this.loaded=false;
				this.frames=0;
				var SPRITE=this,
					counter=0,
					x;
				if(isNaN(delta) && !$.isFunction(delta) || delta<1) delta=1;
				SPRITE.loaded=false;
				for(var n=1;n<=maxnum;n+=x)
				{
					var img=new Image();
					img.src=srcPattern.replace(/\{n\}/ig,n);
					n-1 && $(img).hidden();
					$(img).appendTo(THIS);
					if(img.complete) done();
					else img.onload=done;
					x=$.isFunction(delta) ? delta(n,maxnum) : delta;
				}
				function done()
				{
					counter++;
					funs.loading(counter,maxnum);
					if(counter==THIS.find("img").length)
					{
						SPRITE.loaded=true;
						funs.loaded(counter);
					}
				}
				return this;
			},
			timer:0,
			play:function(piSpeed,iLoop){
				if(!piSpeed || isNaN(piSpeed)) piSpeed=50;
				if(isNaN(iLoop)) iLoop=0;
				var imgs=THIS.find("img"),
					l=imgs.length,
					n=0,
					SPRITE=this,
					step=this.step;
				timer=setInterval(function(){
					imgs.eq(n).visible();
					funs.show(n);
					SPRITE.at=n;
					var last=(n-step+l)%l;
					imgs.eq(last).hidden();
					funs.hide(last);
					n+=step;
					if(n>=l) iLoop ? (n=0,iLoop--,funs.loop(iLoop)) : SPRITE.stop();
				},piSpeed);
				return this;
			},
			rewind:function(piSpeed,iLoop){
				if(!piSpeed || isNaN(piSpeed)) piSpeed=50;
				var imgs=THIS.find("img"),
					l=imgs.length,
					n=l-1,
					SPRITE=this,
					step=this.step;
				n-=n%step;
				timer=setInterval(function(){
					imgs.eq(n).visible();
					funs.show(n);
					SPRITE.at=n;
					var last=(n+step)%l;
					imgs.eq(last).hidden();
					funs.hide(last);
					n-=step;
					if(n<0) iLoop ? (n=l-1,iLoop--,funs.loop(iLoop)) : SPRITE.stop();
				},piSpeed);
				return this;
			},
			stop:function(){
				clearInterval(timer);
				timer=0;
				funs.stop();
				return this;
			},
			show:function(n){
				var imgs=THIS.find("img"),
					vss=imgs.filter(":visible");
				if(n>=imgs.length) return false;
				imgs.eq(n).visible();
				vss.hidden();
				return this;
			}
		}
	}
});