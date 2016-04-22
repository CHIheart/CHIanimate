// JavaScript Document
function CHIcalendar()
{
	var o=new Object();
	o.id="CHIcalenderDiv";
	var ap/*aiming input*/,t/*target*/;
	o.focus=function(inputid){
		if(!t)init();
		if(!$("#"+inputid).size())return false;
		ap=inputid;
		open();
	}
	function open(){
		resize();
		$(window).resize(function(){resize()});
		var pr=new Date(val(ap));
		fresh(pr.getFullYear(),pr.getMonth()+1);
		var init=function(){t.fadeIn();}
		CHIbg.show(init);
	}
	function close(value){
		if(value!=undefined)
		{
			val(ap,value);
			$("#"+ap+" + label").html(value);
		}
		ap='';
		$(window).unbind("resize",resize);
		t.fadeOut("normal",function(){CHIbg.hide();});
	}
	function resize(){
		var tw=t.width(),th=t.height();
		var ww=Math.max(tw,$(window).width()),wh=Math.max(th,$(window).height());
		var ow=t.outerWidth(true),oh=t.outerHeight(true);
		var w=Math.min(ow,ww),h=Math.min(oh,wh);
		t.css({
			"top":Math.max(0,(wh-h)*0.5)+"px"
			,"left":Math.max(0,(ww-w)*0.5)+"px"
		});
		t.children("dd").css({
			"height":h-t.children("dt").outerHeight(true)+"px"
		});
	}
	function init(){
		t=$('#'+o.id);
		/*标签头的行为*/
		t.children("dt").children("input").click(function(){
			t.children("dd").children("div").hide();
			t.children("dd").children("div:nth-of-type("+($(this).index()/2+1)+")").show();
		});
		t.children("dt").children("input:first-child").click();
		t.children("dt").find("q").click(function(){close();});
		//所有数字输入框的行为
		$("#CHIcalenderDiv input[type=number]").keyup(function(){
			if(!str_int_pos.test(this.value) || !this.value)this.value=Math.abs(parseInt(this.value)) || 0;
			else this.value=parseInt(this.value);
		});
		/*****************基本标签内容下的行为*/
		var b=$("#CalendarBasicDiv");
		var y=$("#CalendarBasicYear");
		var m=$("#CalendarBasicMonth");
		/*年的输入框*/y.keyup(function(){fresh();});
		/*月的下拉菜单*/m.change(function(){fresh();});
		/*翻页的效果*/var fa=b.find("ul a");
		fa.eq(0).click(function(){//上一年
			fresh(y.val()*1-1);
		});
		fa.eq(1).click(function(){//上个月
			var mon=m.val()*1,yea=y.val()*1;
			yea=mon==1?yea-1:yea;
			mon=mon==1?12:mon-1;
			fresh(yea,mon);
		});
		fa.eq(2).click(function(){//下个月
			var mon=m.val()*1,yea=y.val()*1;
			yea=mon==12?yea+1:yea;
			mon=mon==12?1:mon+1;
			fresh(yea,mon);
		});
		fa.eq(3).click(function(){//下一年
			fresh(y.val()*1+1);
		});
		//预先刷新被选中的计算标签中的选项，防止FF的表单内容预留
		computeTip(1,'b');
		computeTip(2,'q');
		computeTip(3,'ins');
		freshTip('kbd',val("CalendarComputeCounts"));
		//示例里边，可以直接锁定到被选日和今天的位置上，如果没有被选日，则无行为
		$("#CalendarBasicDiv p b,#CalendarBasicDiv p b + dfn").click(function(){
			var c=val(ap);
			if(!c)return false;
			c=new Date(c);
			fresh(c.getFullYear(),c.getMonth()+1);
		});
		$("#CalendarBasicDiv p var,#CalendarBasicDiv p var + dfn").click(function(){
			var c=new Date();
			fresh(c.getFullYear(),c.getMonth()+1);
		});
		/*****************计算标签下的内容*/
		var f=function(){clickTip(this,'b')};
		$("#CalendarBaseOnToday").change(f);//“今天”的按钮
		$("#CalendarBaseOnCurrent").change(f);//“被选日”的按钮
		//之前与之后的行为
		$("#CalendarComputeDiv dfn:nth-of-type(2) input[type=radio]").change(function(){clickTip(this,'q')});
		//时间单位的行为，并触发当前的初始化选项
		$("#CalendarComputeDiv dfn:nth-of-type(3) input[type=radio]").change(function(){
			clickTip(this,'ins');
			$("#CalendarComputeCounts + label").html($(this).next("label").eq(0).html());
		});
		$("input[name=CalendarUnit]:checked").change();
		//天数输入的行为
		$("#CalendarComputeCounts").keyup(function(){
			//if(!str_int_pos.test(this.value))this.value=Math.abs(parseInt(this.value)) || 1;
			freshTip('kbd',this.value);
		});
		$("#CalendarComputeDiv div:last-child a").click(compute);
		
		/*****************快捷链接的行为*/
		$("#CalendarRapids a").click(function(){locate(this.id);});
		/*****************组合逻辑里边的激活、禁止行为*/
		$("#CalendarComboInputYear").click(function(){
			disable("CalendarComboYearNum",false);
		});//点击第一排最后一个单选按钮时，开启输入框，谷歌浏览器不支持last-of-type
		$("#CalendarCombo q:first-of-type input[type=radio]").not('#CalendarComboInputYear').click(function(){
			disable("CalendarComboYearNum");
		});//点击前三个按钮时，禁用输入框
		//给四个启用按钮设置点击行为
		$("#CalendarCombo > input").click(function(){enable(this);});
		$("#CalendarRapidDiv div:last-child a").click(rapid);
	}
	function checked(id){return $("#"+id).get(0).checked;}
	function val(id,value){var t=$("#"+id); if(value!=undefined)t.val(value); else return t.val();}
	function reach(id){$("#"+id).focus();}
	function disable(id,bool){
		var z=$("#"+id).get(0);
		if(bool===false)z.removeAttribute("disabled");
		else z.disabled=true;
	}
	function rapid(){
		var y=false;//读年
		if(checked("CalendarComboLastYear"))y=lastyear();
		else if(checked("CalendarComboThisYear"))y=year();
		else if(checked("CalendarComboNextYear"))y=nextyear();
		else if(checked("CalendarComboInputYear"))
		{
			y=val("CalendarComboYearNum");
			if(!y){alert("请输入年！");return false;}
		}
		var m=false;//读月
		if(checked("CalendarComboMonth"))m=val("CalendarGoalMonth");
		var wn=wdn=wd=d=false;//读周数/星期数/星期/天数
		if(checked("CalendarComboDay"))
		{
			d=val("CalendarComboDayNum");
			if(!d){alert("请输入第几天！");reach("CalendarComboDayNum");return false;}
		}
		else if(checked("CalendarComboWeek"))
		{
			wn=val("CalendarComboWeekNum");
			if(!wn){alert("请输入第几周！");reach("CalendarComboWeekNum");return false;}
			wd=val("CalendarComboWeekdayWithWeek");
		}
		else if(checked("CalendarComboWeekday"))
		{
			wdn=val("CalendarComboWeekdayNum");
			if(!wdn){alert("请输入第几个(星期几)！");reach("CalendarComboWeekdayNum");return false;}
			wd=val("CalendarComboWeekdayWithNum");
		}
		var nd;//计算新日期
		if(m!==false)
		{//有月
			if(d!==false)
			{//年月日格式
				if(d<=maxday(m,y)) nd=new Date(y+'-'+fill(m)+'-'+fill(d));
				else {alert("天数过大！");reach("CalendarComboDayNum");return false;}
			}
			else if(wn!==false)nd=weekinmonth(wd,wn,m,y);//年月周星期格式
			else if(wdn!==false)nd=weekdayinmonth(wd,wdn,m,y);//年月星期格式
		}
		else if(d!==false)nd=dayinyear(d,y);//年日格式
		else if(wn!==false)nd=weekinyear(wd,wn,y);//年周星期格式
		else if(wdn!==false)nd=weekdayinyear(wd,wdn,y);//年星期格式
		if(!nd){alert("日期超出！");return false;}
		getto(nd);
	}
	function enable(tar){
		if(tar.name && tar.checked)//如果有name则是三个日数单选框，需要先禁用所有，再开启指定
		{
			var name=tar.name;
			var radios=$("input[name="+name+"]");
			$("input[name="+name+"] + label + q").find("input,select").attr({"disabled":true});
		}
		var x=$(tar).nextAll("q").eq(0).find("input,select").map(function(){
            if(tar.checked) this.removeAttribute("disabled"); else this.disabled=true;
			//alert(this.id+' in '+tar.id+' disabled='+this.disabled);
        });;
	}
	function tag(d){//根据日期d来判断，要显示的日期是否使用特殊的标签
		var c=new Date(val(ap));
		var n=new Date(date('-',1));
		var r=0;
		if(datediff(d,n)==0)r+=2;
		if(datediff(d,c)==0)r+=1;
		switch(r)
		{
			case 0: r=Array('','');break;
			case 1: r=Array('<b>','</b>');break;//与被选日期相同使用b
			case 2: r=Array('<var>','</var>');break;//与今天相同使用del
			case 3: r=Array('<ins>','</ins>');//既是今天，又是被选日期，使用ins
		}
		return r;
	}
	function fresh(yy,mm){//使用翻页，或输入年份，或选择月份时，刷新日历
	/**************基本标签下的内容*/
		var str=('<del lang="zh" class="fa fa-calendar"></del><em>日</em><em>一</em><em>二</em><em>三</em><em>四</em><em>五</em><em>六</em><br />');
		var y=yy?yy:val("CalendarBasicYear"),m=mm?mm:val("CalendarBasicMonth");
		val("CalendarBasicYear",y);
		val("CalendarBasicMonth",m);
		var f=new Date(y,m-1,1);
		var wf=f.getDay();
		var maxd=maxday(m,y);
		var week=weekofyear(f);
		var weekcnt=0;
		str+='<i>'+week+'</i>';
		if(f)
		{
			var pre=Array();//如果1号不是周日，前边要补足上个月的末几天
			var lm/*last month*/=m==1?12:m-1;
			var ly/*last year*/=m==1?y-1:y;
			var md=m==1?31:maxday(lm,y);
			for(var i=0;i<wf;i++) pre.push(md-wf+i+1);
			for(i=0;i<pre.length;i++,weekcnt++)
			{
				var tags=tag(new Date(ly+'-'+fill(lm)+'-'+fill(pre[i])));
				str+='<q>'+tags[0]+pre[i]+tags[1]+'</q>';
			}
		}
		for(i=1;i<maxd+1;i++,weekcnt++)
		{
			if(weekcnt==7)
			{
				week++;
				str+='<i>'+week+'</i>';
				weekcnt%=7
			}
			var tags=tag(new Date(y+'-'+fill(m)+'-'+fill(i)));
			str+='<a>'+tags[0]+i+tags[1]+'</a>';
		}
		i=1;
		if(weekcnt!=7)
		{
			var nm=m==12?1:m+1;
			var ny=m==12?y+1:y;
			while(weekcnt!=7)
			{
				var tags=tag(new Date(ny+'-'+fill(nm)+'-'+fill(i)));
				str+='<q>'+tags[0]+i+tags[1]+'</q>';
				i++;weekcnt++;
			}
		}
		$("#CalendarBasicDiv > dl > dd").html(str)
			.find("a").click(function(){
				/*点击日历上的可获取日期，则直接获取日期，并关闭*/
				close(
					val("CalendarBasicYear")+'-'
					+fill(val("CalendarBasicMonth"))+'-'
					+fill($(this).text())
				);
			});
	/**************计算标签下的内容*/
		$("#CalendarComputeToday").text(date('-',1));//“今天”的提示
		var cur=val(ap);
		if(cur)
		{//如果有被选日期，则开启“被选日”选项，并刷新“被选日”的提示
			disable("CalendarBaseOnCurrent",false);
			$("#CalendarComputeCurrent").text(cur);
		}
		else
		{
			$("#CalendarBaseOnToday").click();
			disable("CalendarBaseOnCurrent");
		}
		val("CalendarBaseOnToday",date('-',1));//“今天”的值
		val("CalendarBaseOnCurrent",val(ap));//“被选日”的值
	/**************快捷标签下-组合逻辑的内容*/
		$("#CalendarCombo > input").map(function(){enable(this);});
	}
	/*分别处理计算标签内容中的，点击，刷新，计算各计算部件内容*/
	function clickTip(radio,tiptag){
		var tip=$(radio).next("label").eq(0).html();
		tip=tip.substring(0,tip.indexOf("<span"));
		freshTip(tiptag,tip);
	}
	function freshTip(tiptag,text){$("#CalendarComputeDiv p "+tiptag).text(text);}
	function computeTip(index,tiptag){clickTip($("#CalendarComputeDiv dfn:nth-of-type("+index+") input[type=radio]:checked").get(0),tiptag);}
	function compute(){//计算并在日历中定位
		var n/*num*/=val("CalendarComputeCounts");
		if(!n){alert("请输入数量！");return false;}
		var bd/*base date*/=$("#CalendarComputeDiv dfn:nth-of-type(1) input[type=radio]:checked").val();
		var dir/*direction*/=$("#CalendarComputeDiv dfn:nth-of-type(2) input[type=radio]:checked").val();
		var u/*unit*/=$("#CalendarComputeDiv dfn:nth-of-type(3) input[type=radio]:checked").val();
		getto(dateadd(dir*n,bd,u));
	}
	function getto(nd){
		var y=nd.getFullYear(),m=nd.getMonth()+1,d=nd.getDate();
		nd=y+'-'+fill(m)+'-'+fill(d);
		val(ap,nd);
		$("#"+ap+" + label").text(nd);
		val("CalendarComputeCurrent",nd);
		$("#CalendarBasic").click();
		fresh(y,m);
		close(nd);
	}
	function locate(id){
		id=id.replace("CalendarRapid_",'');
		var dir=-1,u='d',n=1;
		switch(id)
		{
			case "LY": u='y';break;
			case "LM": u='m';break;
			case "LW": u='w';break;
			case "BY": n=2;break;
			case "YD": break;
			case "TD": dir=0;break;
			case "TM": dir=1;break;
			case "AT": dir=1;n=2;break;
			case "NW": u='w';dir=1;break;
			case "NM": u='m';dir=1;break;
			case "NY": u='y';dir=1;break;
			default: close('');
		}
		getto(dateadd(dir*n,date(),u));
	}
	return o;
}
var CHIcal=new CHIcalendar();

(function(){
	//头部标签
	document.write('<dl id="CHIcalenderDiv"><dt>'
		+'<input id="CalendarBasic" type="radio" name="CalendarController" checked="checked" />'
		+'<label for="CalendarBasic"><i class="fa fa-calendar"></i>基本</label>'
		+'<input id="CalendarCompute" type="radio" name="CalendarController" />'
		+'<label for="CalendarCompute"><i class="fa fa-cogs"></i>运算</label>'
		+'<input id="CalendarRapid" type="radio" name="CalendarController" />'
		+'<label for="CalendarRapid"><i class="fa fa-rocket"></i>快捷</label>'
		+'<q class="fa fa-times-circle"></q>'
		+'</dt><dd>');
	//头部标签
	//基本标签内容
	document.write('<div id="CalendarBasicDiv">');
	//头部年月
	var MonthsOptionString;
	var n=new Date();
	var y=year();
	var m=month();
	var d=day();
	for(var i=1;i<13;i++)MonthsOptionString+='<option value="'+i+'"'+(i==m?' seledcted="selected"':'')+'>'+i+'</option>';
	document.write('<dl><dt><input id="CalendarBasicYear" type="number" maxlength="4" value="'+ y +'" /> <label for="CalendarBasicYear">年</label> <select id="CalendarBasicMonth">'+ MonthsOptionString +'</select> <label for="CalendarBasicMonth">月</label></dt>');
	//日期
	document.write('<dd></dd>');
	//示例
	document.write('</dl><p><span>示例：</span><br />'
		+'<b title="被选日，点击定位到被选日">n</b><dfn title="被选日，点击定位到被选日">被选日</dfn><br />'
		+'<var title="今天，点击定位到今天">m</var><dfn title="今天，点击定位到今天">今天</dfn><br />'
		+'<ins title="今天及被选日">x</ins><dfn>今天及被选日</dfn></p>');
	//分页
	document.write('<ul><li><a><i class="fa fa-fast-backward"></i>去年</a></li><li><a><i class="fa fa-step-backward"></i>上月</a></li><li><a><i class="fa fa-step-forward"></i>下月</a></li><li><a><i class="fa fa-fast-forward"></i>明年</a></li></ul>');
	document.write('</div>');
	//基本标签内容
	//计算标签内容
	document.write('<div id="CalendarComputeDiv">');
	document.write('<var>基于</var><dfn>'
		+'<input type="radio" name="CalendarBaseOn" id="CalendarBaseOnToday" checked="checked" />'
		+'<label for="CalendarBaseOnToday">今天<span id="CalendarComputeToday"></span></label>'
		+'<input type="radio" name="CalendarBaseOn" id="CalendarBaseOnCurrent" />'
		+'<label for="CalendarBaseOnCurrent">被选日<span id="CalendarComputeCurrent"></span></label>'
		+'</dfn>');
	document.write('<var>方向</var><dfn>'
		+'<input type="radio" value="-1" name="CalendarCountTo" id="CalendarCountBefore" checked="checked" />'
		+'<label for="CalendarCountBefore">之前<span>较早的日期</span></label>'
		+'<input type="radio" value="1" name="CalendarCountTo" id="CalendarCountAfter" />'
		+'<label for="CalendarCountAfter">之后<span>较晚的日期</span></label>'
		+'</dfn>');
	document.write('<var>单位</var><dfn>'
		+'<input type="radio" value="d" name="CalendarUnit" id="CalendarUnitDay" checked="checked" />'
		+'<label for="CalendarUnitDay">天<span>按天计算</span></label>'
		+'<input type="radio" value="w" name="CalendarUnit" id="CalendarUnitWeek" />'
		+'<label for="CalendarUnitWeek">周<span>按周计算同星期位置</span></label>'
		+'<input type="radio" value="m" name="CalendarUnit" id="CalendarUnitMonth" />'
		+'<label for="CalendarUnitMonth">月<span>按月计算同日期位置</span></label>'
		+'<input type="radio" value="y" name="CalendarUnit" id="CalendarUnitYear" />'
		+'<label for="CalendarUnitYear">年<span>按年计算同日期位置</span></label>'
		+'</dfn>');
	document.write('<var>数量</var><dfn><input type="number" value="1" id="CalendarComputeCounts" maxlength="3" />'
		+' <label for="CalendarComputeCounts">天</label></dfn>'
		+'<p>从<b>今天</b>计算<kbd>1</kbd><ins>天</ins><q>之前</q></p>'
		+'<div><a><i class="fa fa-location-arrow"></i>定位</a></div>');
	document.write('</div>');
	//计算标签内容
	//快速标签内容
	document.write('<div id="CalendarRapidDiv">');
	document.write('<div id="CalendarRapids">'
		+'<h4>快捷<br />链接</h4>'
		+'<a id="CalendarRapid_LY">一年前</a><a id="CalendarRapid_LM">一个月前</a><a id="CalendarRapid_LW">一周前</a>'
		+'<a id="CalendarRapid_BY">前天</a><br /><a id="CalendarRapid_YD">昨天</a><a id="CalendarRapid_TD">今天</a><br />'
		+'<a id="CalendarRapid_TM">明天</a><a id="CalendarRapid_AT">后天</a><br /><a id="CalendarRapid_NW">一周后</a>'
		+'<a id="CalendarRapid_NM">一个月后</a><a id="CalendarRapid_NY">一年后</a><a id="CalendarRapid_NO">留空</a>'
		+'</div>');
	document.write('<div id="CalendarCombo">');
	document.write('<h4>组合<br />逻辑</h4>');
	document.write('<q class="w">'
		+'<input type="radio" name="CalendarComboYear" id="CalendarComboLastYear" />'
		+'<label for="CalendarComboLastYear">去年</label>'
		+'<input type="radio" name="CalendarComboYear" id="CalendarComboThisYear" checked="checked" />'
		+'<label for="CalendarComboThisYear">今年</label>'
		+'<input type="radio" name="CalendarComboYear" id="CalendarComboNextYear" />'
		+'<label for="CalendarComboNextYear">明年</label><br />'
		+'<input type="radio" name="CalendarComboYear" id="CalendarComboInputYear" />'
		+'<label for="CalendarComboInputYear">输入</label>'
		+'<input type="number" id="CalendarComboYearNum" maxlength="4" value="'+ year() +'" disabled="disabled" />'
		+'<label for="CalendarComboYearNum">年</label>'
		+'</q><br />');
	document.write('<input type="checkbox" value="1" id="CalendarComboMonth" />'
		+'<label for="CalendarComboMonth"></label>'
		+'<q class="s"><select id="CalendarGoalMonth">'+ MonthsOptionString +'</select> 月</q><br />');
	document.write('<input type="radio" checked="checked" name="CalendarComboDays" id="CalendarComboDay" />'
		+'<label for="CalendarComboDay"></label>'
		+'<q class="s">'
		+'<label for="CalendarComboDayNum">第</label>'
		+'<input type="number" id="CalendarComboDayNum" maxlength="3" value="1" />'
		+'<label for="CalendarComboDayNum">天</label>'
		+'</q><br />');
	var WeekdaysOptionString='<option value="0">日</option><option value="1">一</option><option value="2">二</option><option value="3">三</option><option value="4">四</option><option value="5">五</option><option value="6">六</option>';
	document.write('<input type="radio" name="CalendarComboDays" id="CalendarComboWeek" />'
		+'<label for="CalendarComboWeek"></label>'
		+'<q class="w">'
		+'<label for="CalendarComboWeekNum">第</label>'
		+'<input type="number" id="CalendarComboWeekNum" maxlength="2" value="1" min="1" max="53" />'
		+'<label for="CalendarComboWeekNum">周的星期</label>'
		+'<select id="CalendarComboWeekdayWithWeek">'+ WeekdaysOptionString +'</select>'
		+'</q><br />');
	document.write('<input type="radio" name="CalendarComboDays" id="CalendarComboWeekday" />'
		+'<label for="CalendarComboWeekday"></label>'
		+'<q class="w">'
		+'<label for="CalendarComboWeekdayNum">第</label>'
		+'<input type="number" id="CalendarComboWeekdayNum" maxlength="2" value="1" min="1" max="53" />'
		+'<label for="CalendarComboWeekdayNum">个星期</label>'
		+'<select id="CalendarComboWeekdayWithNum">'+ WeekdaysOptionString +'</select>'
		+'</q>');
	document.write('</div><div><a><i class="fa fa-location-arrow"></i>定位</a></div>');
	document.write('</div>');
	//快速标签内容
	document.write('</dd></dl>');
})();
