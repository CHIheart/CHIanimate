//文字动画效果
//打字效果
function CHItypist(DOMid,settings)
{
	if(!settings)settings={};
	var t=$('#'+DOMid);
	t.cnt=0;
	t.primaryText=t.text();
	var speed=settings.speed?settings.speed:50;
	t.timer=setInterval(function(){
		if(t.cnt==t.primaryText.length){clearInterval(t.timer)}
		var text=t.primaryText;
		t.text(text.substr(0,t.cnt));
		t.cnt++;
	},speed);
}
