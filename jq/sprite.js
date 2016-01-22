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
		play(settings)，控制播放，参数为配置集合对象，可以使用的属性有
			speed，每张图间隔的毫秒数，默认为50
			loop，布尔值，是否循环播放，默认为0，可以为正整数，为-1时无限循环
			from，从第几张开始播放，可以为0~n-1，也可以为关键字all（即n-1）
			to，播放到第几张，说明同from
			key，循环关键帧，如果是循环的话，会从这一帧开始循环，默认为false，为从最头/尾帧开始
			callback，回调函数，可以额外设置与生成对象时不同的回调函数，会一起执行
		forward/rewind(speed,loop)，正向/反向播放全图，参数同上
	*/
	$.fn.sprite=function(setFuns){
		var THIS=this,
			funs=$.extend({
				loaded:$.noop,
				loading:$.noop,
				show:$.noop,
				hide:$.noop,
				loop:$.noop,
				stopped:$.noop,
				played:$.noop,
				rewound:$.noop
			}, setFuns),
			timer
		;
		return {
			loaded:false,
			step:1,
			at:0,
			fill:function(srcPattern,maxnum,delta){
				if(isNaN(maxnum) || maxnum<=0) {console.error("maxnum不对");return false;}
				THIS.empty();
				this.loaded=false;
				this.frames=0;
				var SPRITE=this,
					counter=0,
					x,
					nums=[];
				if(isNaN(delta) && !$.isFunction(delta) || delta<1) delta=1;
				for(var n=1;n<=maxnum;n+=x)
				{
					nums.push(n);
					x=$.isFunction(delta) ? delta(n,maxnum) : delta;
				}
				for(var n in nums)
				{
					n*=1;
					var img=new Image();
					img.src=srcPattern.replace(/\{n\}/ig,nums[n]);
					!!n && $(img).hidden();
					$(img).appendTo(THIS);
					if(img.complete) done();
					else img.onload=done;
				}
				function done()
				{
					counter++;
					funs.loading(counter,maxnum);
					if(nums.length==counter)
					{
						SPRITE.loaded=true;
						funs.loaded(counter);
					}
				}
				return this;
			},
			timer:0,
			play:function(settings){
				var options={
					speed:50,
					loop:0,
					from:0,
					to:'all',
					key:false,
					callback:$.noop
				};
				$.extend(options, settings);
				var imgs=THIS.find("img"),
					l=imgs.length,
					cur=options.from=='all' ? l-1 : options.from,
					loops=options.loop,
					key=loops && (options.key===false ? cur : options.key),
					end=options.to=='all' ? l-1 : options.to,
					SPRITE=this,
					reversed=cur>end,
					dir=reversed ? -1:1,
					step=this.step * dir,
					cbfun=$.isFunction(options.callback) ? options.callback : $.noop;
				timer=setInterval(function(){
					var last=(cur-step+l)%l;
					SPRITE.at=cur;
					imgs.eq(cur).visible().siblings().hidden();
					funs.show(cur);
					funs.hide(last);
					cur+=step;
					//判断是否数字在范围外，如果是则判断是否循环
					(reversed && cur<end || !reversed && cur>end) && (
						loops ?
						(cur=key,loops--,funs.loop(loops)) :
						(SPRITE.stop(dir),funs[reversed ? 'rewound':'played'](),cbfun())
					);
				},options.speed);
				return this;
			},
			forward:function(piSpeed,iLoop){
				return this.play({
					speed:piSpeed || 50,
					loop:iLoop || 0,
					from:0,
					to:'all'
				});
			},
			rewind:function(piSpeed,iLoop){
				return this.play({
					speed:piSpeed || 50,
					loop:iLoop || 0,
					from:'all',
					to:0
				});
			},
			stop:function(dir){
				clearInterval(timer);
				timer=0;
				funs.stopped(dir);
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