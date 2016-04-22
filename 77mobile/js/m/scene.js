//单帧类
function CHIscene(id,settings)
{
	if(!$("#"+id).size())return false;
	if(!settings)settings={};
	this.id=id;
	this.T=$("#"+id);
	this.T.css("position","absolute");
	this.hide=function(){this.T.hide();return this;}
	this.hideAll=function(){this.T.children().hide();return this;}
	this.show=function(){this.T.show();return this;}
	this.showAll=function(){this.T.children().show();return this;}
	//state：ready,start,stop,over,ing
	this.T.state='ready';
	this.ready=function(){
		//准备所有元素的起始位置，并state='ready'
		this.hideAll();
		this.allState(this.T,'ready','set');
		return this;
	}
	this.stop=function(b){
		//所有元素停止动作，并state='stop'，参数b为执行时会变成JQobj.stop(b)
		if(b==undefined)b=this.stopTrue;
		this.allState(this.T,'stop','set',b);
		return this;
	}
	this.start=function(){
		this.showAll();
		/*
		----每个元素在动作之前，先state='ing'，然后所有元素开始自行动作
			每个元素完成后自己state='start'
		----如果需要在本幕所有元素完成后，执行某一效果，则需要在外部定义start中，写入函数afterStart
			****如果使用CHIexecute执行线性执行时，afterStart需要是参数数组中最后一个元素，且afterStart中不需要判断allState
				var afterStart=function(){something...}
				CHIexecute([
					function(cbfun){child_0.start(cbfun)}
					,function(cbfun){child_1.start(cbfun)}
					,afterStart
				]);
			****如果使用setTimeout来自由执行时，afterStart需要是每个元素的start的回调函数，且afterStart必须判断allState
				var afterStart=function(){
					if(scene.allState(scene.T,'start'))
					{something...}
				}
				setTimeout(function(){child_0.start(afterStart)},100);
				setTimeout(function(){child_1.start(afterStart)},500);
		*/
		return this;
	}
	this.over=function(cbfun){
		/*
		over机制同start
		由于是由Director来控制流程，所以over函数，不可直接调用runout
		当over完成，afterOver完成，Scene处于等待状态
		由Director调用本Scene的runout，及下一Scene的runin
		如果要插入"重播"功能，则replay适合做over的回调函数
		afterOver必须要有cbfun作为参数，给Director控制播放下一幕作入口
			var afterOver=function(cbfun){
				if(scene.allState(scene.T,'over'))
				{
					something...
					if(cbfun)cbfun();
				}
			}
		*/
		return this;
	}
	this.reset=function(cbfun_start){
		//reset机制同start，但reset的回调就是start函数
		//reset一般是由特定的replay函数调用，正常情况下很少出现
		return this;
	}
	this.runin=function(lastIndex,cbfun_in){
		//runin需要单独写效果，在runin完成后，自动调用start函数
		//lastIndex是下一幕的索引，可以区别播放的顺序
		var me=this.T.index();
		this.show();
		this.state='coming';
		var scene=this;
		this.T.css({left:(me>lastIndex)?"100%":"-100%"})
			.animate(
				{left:"0%"}
				,'',''
				,function(){
					if(scene.reStart)scene.start();
					scene.state='arrived';
					if(cbfun_in)cbfun_in();
				}
			);
		return this;
	}
	this.runout=function(nextIndex,cbfun_out){
		//完全满足state时才执行
		//nextIndex是下一幕的索引，可以区别播放的顺序
		var me=this.T.index();
		this.state='going'
		var scene=this;
		function OUT()
		{
			scene.T.animate(
				{left:(me>nextIndex)?"100%":"-100%"}
				,'',''
				,function(){
					if(scene.reReady)scene.ready();
					scene.state='absent';
					if(cbfun_out)cbfun_out();
				}
			);
		}
		if(this.runStop)
		{//如果不停止的话，也就是出场仍继续播放，所以不能执行over()
			this.stop();
			this.runOver ? this.over(OUT) :OUT();
		}
		else OUT();
		return this;
	}
	/*
	向下深度访问状态，由于动画可能随时改变状态（比如还没完全start就stop）
	所以每次都要从根元素Scene开始，向下访问所有元素
	mode=set时，正常情况只用于scene.ready或scene.stop等瞬间执行的效果
	mode=get时，遇到不同的状态就返回false，否则递归到完成才返回true
	如果是set，则第四参para，是对象要执行对应状态函数的参数
	被检查的元素必须是DOM.actor=true，有些元素是不需要被检查的，不参与动画流程
	*/
	this.allState=function(JQobj,state,mode,para)
	{
		if(mode!='set') mode='get';
		var ks=JQobj.children();
		for(var i=0;i<ks.size();i++)
		{
			var k=ks[i];
			if(!k.actor) continue;
			if(mode=='set')
			{
				if(state in k)
				{
					if(para==undefined) para=this.runStop;
					k[state](true,para);
				}
				k.state=state;
			}
			else if(k.state!=state) return false;
			if($(k).children().size())
			{
				var r=this.allState($(k),state,mode,para);
				if(mode=='get' && !r)return false;
			}
		}
		if(mode=='get')return true;
	}
	/*
	参数设置，默认
		reReady=true，本幕退出后，重新执行一次ready()
		runOver=true，本幕退出前，执行一次over()
		runStop=true，本幕退出前，执行一次stop()，如果runStop=false的话，runOver就会被忽略
		stopTrue=true，本幕在被stop时，执行stop(true,true)
		reStart=true，本幕进入后，重新执行一次start()；如果为false的话，本幕已经执行过一次start的话，就不会再执行，一直持续start完成后的状态
	*/
	this.set=function(settings){
		if(!settings)settings={};
		this.reReady=("reReady" in settings)?settings.reReady:true;
		this.runOver=("runOver" in settings)?settings.runOver:true;
		this.runStop=("runStop" in settings)?settings.runStop:true;
		this.stopTrue=("stopTrue" in settings)?settings.stopTrue:true;
		this.reStart=("reStart" in settings)?settings.reStart:true;
		this.started=false;
	}
	this.set(settings);
}
