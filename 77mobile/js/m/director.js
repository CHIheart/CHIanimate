//全剧类，所有帧必须为siblings，且不能有其它无关的元素并列存在
function CHIdirector(id,settings)
{
	var DIRECTOR=this;
	this.id=id;
	this.T=$("#"+ id);
	if(!this.T.size())return false;
	this.T.css("position","relative");
	this.cur=0;
	this.scenes=[];
	var ss=this.T.children();
	for(var i=0;i<ss.size();i++)
	{
		var sid=this.id + '_Scene'+i;
		ss.eq(i).attr("id",sid);
		var scene=new CHIscene(sid);
		this.scenes.push(scene);
		if(i) scene.hide();
	}
	if(!settings)settings={};
	this.set=function(settings){
		/*
			设置参数
			****默认
				autoStart=true，自动开始，可以为数字，等待若干秒后开始播放
				autoPlay=true，自动播放，可以为数字，等待若干秒后播放下一幕
			****最后几个参数，影响本对象所有scene对象的共同属性
				runOver，reReady，runStop，stopTrue，reStart
		*/
		if(!settings)settings={};
		this.autoStart=("autoStart" in settings)?settings.autoStart:true;
		this.autoPlay=("autoPlay" in settings)?settings.autoPlay:10;
		for(var n=0;n<ss.size();n++)
		{
			if("runOver" in settings) this.scenes[n].runOver=settings.runOver;
			if("reReady" in settings) this.scenes[n].reReady=settings.reReady;
			if("runStop" in settings) this.scenes[n].runStop=settings.runStop;
			if("stopTrue" in settings) this.scenes[n].stopTrue=settings.stopTrue;
			if("reStart" in settings) this.scenes[n].reStart=settings.reStart;
		}
	}
	this.set(settings);
	this.playing=false;
	this.play=function(n){
		if(this.playing)return;//播放锁定，当上下幕完全出入完成时，才可再次接受播放指令
		var l=this.scenes.length;
		if(l==1 || n==this.cur)return;
		n=(n+l)%l;
		this.stop();
		var curS=this.scenes[this.cur];
		var goalS=this.scenes[n];
		var cur=this.cur;
		function FINISH()
		{//上幕出镜，下幕入镜，两者都完成后才解锁
			if(curS.state=='absent' && goalS.state=='arrived')
			{
				DIRECTOR.playing=false;
				DIRECTOR.cur=n;
				DIRECTOR.start();
			}
		}
		//播放锁定，上幕出，下幕入，各自完成后验证动作完成
		this.playing=true;
		curS.runout(n,FINISH);
		goalS.runin(cur,function(){FINISH();goalS.start();});
	}
	this.next=function(){this.play(this.cur+1);}
	this.prev=function(){this.play(this.cur-1);}
	this.getSceneJQ=function(n){
		return this.getScene(n).T || false;
	}
	this.getScene=function(n){
		var l=this.scenes.length;
		if(n<0 || n>=l)return false;
		return this.scenes[n];
	}
	this.ready=function(cbfun){
		var l=this.scenes.length;
		if(!l)return;
		for(var n=0;n<l;n++) this.scenes[n].ready();
		if(cbfun)cbfun();
		var s0=this.scenes[0];
		if(this.autoStart) setTimeout(function(){s0.start()},this.autoStart * 1000);
		if(this.autoPlay) this.start();
	}
	this.timer=0;
	this.start=function(){
		if(!this.timer)
		{
			this.timer=setInterval(function(){
				DIRECTOR.next();
			},DIRECTOR.autoPlay * 1000);
		}
	}
	this.stop=function(){
		clearInterval(this.timer);
		this.timer=0;
	}
}
