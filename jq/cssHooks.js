(function(){
	//获取boxShadow的某个配置
	var boxShadowKeys='Color,X,Y,Blur,Spread,Inset'.split(',');
	$.fn.boxShadowParams=function(param){
		var params=clearSpace($(this).css("boxShadow"));
		if(params=='none') return param ? (/color/i.test(param) ? "rgb(0,0,0)" : "0px") : ["rgb(0,0,0)","0px","0px","0px","0px"];
		params=params.split(' ');
		if(!param) return params;
		//inset配置有可能不存在
		for(var n in boxShadowKeys) if((new RegExp(boxShadowKeys[n],"i")).test(param)) return params[n] || '';
	}
	for(var n in boxShadowKeys)
	{
		var key=boxShadowKeys[n];
		$.cssHooks["boxShadow"+key]={
			key: key,
			index: n,
			get: function(elem, computed, extra){
				return $(elem).boxShadowParams(this.key);
			},
			set: function(elem, value){
				var params=$(elem).boxShadowParams();
				params[this.index]=value;
				$(elem).css("boxShadow", params.join(' '));
			}
		}
	}
	//获取textShadow的某个配置
	var textShadowKeys='Color,X,Y,Blur'.split(',');
	$.fn.textShadowParams=function(param){
		var params=clearSpace($(this).css("textShadow"));
		if(params=='none') return param ? (/color/i.test(param) ? "rgb(0,0,0)" : "0px") : ["rgb(0,0,0)","0px","0px","0px"];
		params=params.split(' ');
		if(!param) return params;
		for(var n in textShadowKeys) if((new RegExp(textShadowKeys[n],"i")).test(param)) return params[n] || '';
	}
	for(var n in textShadowKeys)
	{
		var key=textShadowKeys[n];
		$.cssHooks["textShadow"+key]={
			key: key,
			index: n,
			get: function(elem, computed, extra){
				return $(elem).textShadowParams(this.key);
			},
			set: function(elem, value){
				var params=$(elem).textShadowParams();
				params[this.index]=value;
				$(elem).css("textShadow", params.join(' '));
			}
		}
	}
	//火狐没有的backgroundPositionX|Y
	var backgroundPositionKeys=['X','Y'];
	for(var n in backgroundPositionKeys)
	{
		var key=backgroundPositionKeys[n];
		$.cssHooks["backgroundPosition"+key]={
			key: key,
			index: n,
			get: function(elem, computed, extra){
				return $(elem).css("backgroundPosition").split(' ')[this.index];
			},
			set: function(elem, value){
				var params=$(elem).css('backgroundPosition').split(' ');
				params[this.index]=value;
				$(elem).css("backgroundPosition", params.join(' '));
			}
		}
	}
})();
