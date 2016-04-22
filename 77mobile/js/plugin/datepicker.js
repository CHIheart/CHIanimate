//日期选择器
//火狐下必须使用双位的月及日数
var CHIdatePicker;
(function(){
	var PATTERN='{YYYY}年{MM}月{DD}日',
		weekdays=['日','一','二','三','四','五','六'];
	document.write('<div class="CHIdatePicker">');
	document.write('<div class="tabs"><h5 class="cur">日历</h5><h5>偏移</h5><h5>快捷</h5><h5>计数</h5><q class="fa fa-times-circle"></q></div>');
	//////////内容层start
	document.write('<div class="contents">');
	//////////日历层start
	document.write('<div class="calendar">');
	document.write('<div class="kyears"><a data-thousand="0">1-999年</a><a data-thousand="1">1000-1999年</a><a data-thousand="2">2000-2999年</a></div>');
	document.write('<div class="centuries kids12 period yearslist"><a><i class="fa fa-reply"></i>千年</a><a>Century<em>世纪</em></a></div>');
	document.write('<div class="decades kids12 period yearslist"><a><i class="fa fa-reply"></i>世纪</a><a>Decade<em>十年</em></a></div>');
	document.write('<div class="years kids12 yearslist"><a><i class="fa fa-reply"></i>十年</a><a>Year<em>年</em></a></div>');
	/////月start
	document.write('<div class="months kids12">');
	document.write('<a data-month="1"><b>1月</b><u>Jan</u></a><a data-month="2"><b>2月</b><u>Feb</u></a><a data-month="3"><b>3月</b><u>Mar</u></a><a data-month="4"><b>4月</b><u>Apr</u></a>');
	document.write('<a data-month="5"><b>5月</b><u>May</u></a><a data-month="6"><b>6月</b><u>Jun</u></a><a data-month="7"><b>7月</b><u>Jul</u></a><a data-month="8"><b>8月</b><u>Aug</u></a>');
	document.write('<a data-month="9"><b>9月</b><u>Sep</u></a><a data-month="10"><b>10月</b><u>Oct</u></a><a data-month="11"><b>11月</b><u>Nov</u></a><a data-month="12"><b>12月</b><u>Dec</u></a>');
	document.write('</div>');
	/////月over
	document.write('<div class="days"><b>周</b><i>日</i><i>一</i><i>二</i><i>三</i><i>四</i><i>五</i><i>六</i></div>');
	document.write('</div>');
	//////////日历层over
	//////////偏移层start
	document.write('<div class="offset">');
	document.write('<table>');
	document.write('<tbody>');
	document.write('<tr><th>起始：</th><td>');
	document.write('<input type="radio" name="CHIdatePicker-from" value="today" id="CHIdatePickerOffsetToday"><label for="CHIdatePickerOffsetToday">今天：<span class="now">'+ Date.date(PATTERN) +'</span></label>');
	document.write('<input type="radio" name="CHIdatePicker-from" value="current" id="CHIdatePickerOffsetCurrent"><label for="CHIdatePickerOffsetCurrent">被选：<span class="current"></span></label>');
	document.write('</td></tr>');
	document.write('<tr><th>方向：</th><td>');
	document.write('<input type="radio" name="CHIdatePicker-to" value="-1" id="CHIdatePickerOffsetBefore"><label for="CHIdatePickerOffsetBefore">前<span>（较早的日期）</span></label>');
	document.write('<input type="radio" name="CHIdatePicker-to" value="1" id="CHIdatePickerOffsetAfter"><label for="CHIdatePickerOffsetAfter">后<span>（较晚的日期）</span></label>');
	document.write('</td></tr>');
	document.write('<tr><th>偏差：</th><td>');
	document.write('<label><input type="text" data-type="number" class="difference" value="0" min="0" max="999"><span>零或正整数</span></label>');
	document.write('</td></tr>');
	document.write('<tr><th>单位：</th><td class="short">');
	document.write('<input type="radio" name="CHIdatePicker-unit" value="Y" id="CHIdatePickerOffsetUnitYear"><label for="CHIdatePickerOffsetUnitYear">年</label>');
	document.write('<input type="radio" name="CHIdatePicker-unit" value="mon" id="CHIdatePickerOffsetUnitMonth"><label for="CHIdatePickerOffsetUnitMonth">月</label>');
	document.write('<input type="radio" name="CHIdatePicker-unit" value="W" id="CHIdatePickerOffsetUnitWeek"><label for="CHIdatePickerOffsetUnitWeek">周</label>');
	document.write('<input type="radio" name="CHIdatePicker-unit" value="D" id="CHIdatePickerOffsetUnitDay"><label for="CHIdatePickerOffsetUnitDay">日</label>');
	document.write('</td></tr>');
	document.write('</tbody>');
	document.write('<tfoot>');
	document.write('<tr><td colspan="2"><p class="tip">从<span class="start"></span>向<span class="direction"></span>数<span class="difference"></span><span class="unit"></span></p></td></tr>');
	document.write('<tr><td colspan="2"><p><i class="fa fa-hand-o-up"></i>定位到新日期<span class="OffsetDate"></span></p></td></tr>');
	document.write('</tfoot>');
	document.write('</table>');
	document.write('</div>');
	//////////偏移层over
	//////////快捷层start
	document.write('<div class="shortcut">');
	document.write('<h5>点击后直接跳转到对应日期</h5>');
	document.write('<div class="quicks">');
	document.write('><a class="TODAY short">今天</a><a class="YESTERDAY short">昨天</a><a class="TOMORROW short">明天</a><a class="BEFOREYESTERDAY short">前天</a><a class="AFTERTOMORROW short">后天</a>');
	document.write('<a class="LASTWEEK">上周的今天</a><a class="NEXTWEEK">下周的今天</a>');
	document.write('<a class="LASTMONTH">上个月的今天</a><a class="NEXTMONTH">下个月的今天</a>');
	document.write('<a class="LASTYEAR">去年的今天</a><a class="NEXTYEAR">明年的今天</a>');
	document.write('<a class="BEFORELAST">前年的今天</a><a class="AFTERNEXT">后年的今天</a>');
	document.write('<a class="LASTCENTURY">上个世纪的今天</a><a class="NEXTCENTURY">下个世纪的今天</a>');
	document.write('<a class="LASTKYEARS">一千年前的今天</a><a class="NEXTKYEARS">一千年后的今天</a>');
	document.write('</div></div>');
	//////////快捷层over
	//////////计数层over
	document.write('<div class="counter">');
	//document.write('<h5>请先选择下列计数方式之一</h5>');
	//第一种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearNumDay">');
	document.write('<label for="CHIdatePicker-YearNumDay">某年的第X天<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('的第<input type="text" data-type="number" min="1" max="366" class="daynum" maxlength="3">天');
	document.write('</p></label>');
	//第二种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearMonthNumDay">');
	document.write('<label for="CHIdatePicker-YearMonthNumDay">某年某月的第X天<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('<select class="monthnum"></select>月');
	document.write('的第<input type="text" data-type="number" min="1" max="31" class="daynum" maxlength="2">天');
	document.write('</p></label>');
	//第三种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearNumWeekWeekday">');
	document.write('<label for="CHIdatePicker-YearNumWeekWeekday">某年第X周的星期X<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('第<input type="text" data-type="number" min="1" max="52" class="weeknum" maxlength="2">周');
	document.write('的星期<select class="weekdaynum"></select>');
	document.write('</p></label>');
	//第四种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearNumWeekday">');
	document.write('<label for="CHIdatePicker-YearNumWeekday">某年的第X个星期X<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('的第<input type="text" data-type="number" min="1" max="53" class="weeknum" maxlength="2">个');
	document.write('星期<select class="weekdaynum"></select>');
	document.write('</p></label>');
	//第五种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearMonthNumWeekday">');
	document.write('<label for="CHIdatePicker-YearMonthNumWeekday">某年某月的第X个星期X<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('<select class="monthnum"></select>月');
	document.write('的第<input type="text" data-type="number" min="1" max="53" class="weeknum" maxlength="2">个');
	document.write('星期<select class="weekdaynum"></select>');
	document.write('</p></label>');
	//第六种
	document.write('<input type="radio" name="CHIdatePicker-counting" id="CHIdatePicker-YearMonthNumWeekWeekday">');
	document.write('<label for="CHIdatePicker-YearMonthNumWeekWeekday">某年某月的第X周的星期X<p>');
	document.write('<input type="text" data-type="number" min="1" max="2999" class="yearnum" maxlength="4">年');
	document.write('<select class="monthnum"></select>月');
	document.write('第<input type="text" data-type="number" min="1" max="52" class="weeknum" maxlength="2">周');
	document.write('的星期<select class="weekdaynum"></select>');
	document.write('</p></label>');
	//预览
	document.write('<p><i class="fa fa-hand-o-up"></i>定位到新日期<span class="CountDate"></span></p>');
	document.write('</div>');
	//////////计数层over
	document.write('</div>');
	//////////内容层over
	//////////预览层start
	document.write('<dl class="btns"><dt>');
	document.write('<label>选年<input type="button" class="tip year"></label>');
	document.write('<label>选月<input type="button" class="tip month"></label>');
	document.write('<label>选日<input type="button" class="tip day"></label>');
	document.write('</dt><dd>');
	document.write('<input type="button" class="submit btn" value="确定">');
	document.write('<input type="button" class="empty btn" value="留空">');
	document.write('</dd></dl>');
	//////////预览层over
	document.write('</div>');
	
	if(!$(".FullScreen").size()) document.write('<table class="FullScreen"><tr><td></td></tr></table>');
	var FullScreen=$(".FullScreen").css({
		display:'none',
		zIndex:55555
	});
	CHIdatePicker=$(".CHIdatePicker").eq(0);
	CHIdatePicker.appendTo(FullScreen.find("td").eq(0));
	
	var CURRENTINPUT,
		curDate,
		curYear,curMonth,curDay,
		calendar=$(".calendar",CHIdatePicker),
		kyears=calendar.find(".kyears"),
		centuries=calendar.find(".centuries"),
		decades=calendar.find(".decades"),
		years=calendar.find(".years"),
		months=calendar.find(".months"),
		days=calendar.find(".days"),
		tipYear=$(".btns .tip.year",CHIdatePicker),
		tipMonth=$(".btns .tip.month",CHIdatePicker),
		tipDay=$(".btns .tip.day",CHIdatePicker)
	;
	
	//获取完整的时间
	function getTime(){
		var sTime=CURRENTINPUT.value;
		curDate=new Date(sTime);
		if(curDate.error())
		{//非正常时间所有数据清空
			curDate=curYear=curMonth=curDay='';
			//countDate=Date.today();
		}
		else
		{//如果是正常日期则直接跳转到日历页
			curYear=curDate.getFullYear();
			curMonth=curDate.getMonth()+1;
			curDay=curDate.getDate();
			//curDate=new Date(curYear,curMonth-1,curDay);
		}
		CurDateUpdate();
		CalendarUpdate();
		OffsetUpdate();
		CountUpdate();
	}
	//刷新当前时间，及当前时间的提示
	function CurDateUpdate()
	{
		if(curYear!=='' && curMonth!=='' && curDay!=='')
		{
			curDate=new Date(curYear,curMonth-1,curDay);
			countDate=curDate;
		}
		else
		{
			curDate='';
			countDate=Date.today();
		}
		tipYear.val(curYear);
		tipMonth.val(curMonth);
		tipDay.val(curDay);
	}
	//给数值型的文本框过滤数值
	$("input[type=number],input[data-type='number']").on('change input propertychange',function(){
		var v=this.value,
			maxV=this.max,
			minV=this.min;
		if(!/^\d*$/.test(v)) v=v.replace(/[^\d]/g,'');
		else if(!v) v=0;
		else if(v*1>maxV) v=maxV;
		else v=v*1;
		this.value=v;
	});
	//点击标签栏的标题
	var topics=$(".tabs h5",CHIdatePicker).click(function(){
		$(this).addClass("cur").siblings().removeClass("cur");
		$(".contents",CHIdatePicker).children().eq($(this).index()).show()

			.siblings().hide();
	});
	/////////////////////////////////////////////////////日历部分
	//日历层各项更新
	function CalendarUpdate(){
		if(curYear)
		{
			var thousand=Math.floor(curYear/1000);
			kyears.find('a[data-thousand="'+ thousand +'"]').click();
			var hundred=Math.floor(curYear/100);
			centuries.find('a[data-hundred="'+ hundred +'"]').click();
			var ten=Math.floor(curYear/10);
			decades.find('a[data-ten="'+ ten +'"]').click();
			years.find('a[data-year="'+ curYear +'"]').click();
			months.find('a[data-month="'+ curMonth +'"]').click();
			days.find('a[data-day="'+ curDay +'"]').click();
			show(5);
		}
		else
		{
			show(0);
			years.find("a").removeClass("checked");
			months.find("a").removeClass("checked");
			days.find("i:last").nextAll().remove();
		}
	}
	//12格布局中，除了月份，剩下的，第一子元素都是返回
	function prev(){
		var index=calendar.children(":visible").index(),
			allnum=calendar.children().length;
		show((index-1+allnum)%allnum);
	}
	function next(){
		var index=calendar.children(":visible").index(),
			allnum=calendar.children().length;
		show((index+1)%allnum);
	}
	function show(page){
		calendar.children().eq(page).show().siblings().hide();
	}
	$(".kids12",calendar).not(months).find("a:first").click(function(){
		prev();
	});
	//点击千年的选项
	kyears.delegate("a",'click',function(){
		var thousand=$(this).data("thousand");
		if(!thousand) thousand='';
		//给世纪列表填充选项
		centuries.children().not(":first").not(":last").remove();
		centuries.children().first().after(function(){
			var str=[];
			for(var n=0;n<10;n++)
			{
				var prefix=thousand + '' + n;
				if(prefix=='0') prefix='';
				str.push('<a data-hundred="'+ prefix +'">'+ prefix + (!prefix ? '1' : '00') +'<s>|</s>'+ prefix +'99</a>');
			}
			return str.join('');
		});
		next();
	});
	//点击世纪的选项
	centuries.delegate("a[data-hundred]",'click',function(){
		var hundred=$(this).data("hundred");
		//给十年列表填充选项
		decades.children().not(":first").not(":last").remove();
		decades.children().first().after(function(){
			var str=[];
			for(var n=0;n<10;n++)
			{
				var prefix=hundred+''+n;
				if(prefix=='0') prefix='';
				str.push('<a data-ten="'+ prefix +'">'+ prefix + (prefix=='' ? '1' : '0') +'<s>|</s>'+ prefix +'9</a>');
			}
			return str.join('');
		});
		next();
	});
	//点击十年的选项
	decades.delegate("a[data-ten]",'click',function(){
		var ten=$(this).data("ten");
		
		//给年列表填充选项
		years.children().not(":first").not(":last").remove();
		years.children().first().after(function(){
			var str=[],thisyear=Date.year();
			for(var n=0;n<10;n++)
			{
				if(!n && !ten) continue;
				var prefix=ten +''+ n,
					yearnum=ten +''+ n,
					checked=curYear==yearnum,
					today=thisyear==yearnum,
					classname='';
				if(prefix=='0') prefix='';
				if(checked && today) classname=' class="today checked"';
				else if(checked) classname=' class="checked"';
				else if(today) classname=' class="today"';
				str.push('<a data-year="'+ yearnum +'"'+ classname +'>'+ yearnum +'</a>');
			}
			return str.join('');
		});
		next();
	});
	//点击年的选项
	years.delegate("a[data-year]",'click',function(){
		$(this).addClass("checked").siblings().removeClass("checked");
		curYear=$(this).data("year");
		CurDateUpdate();
		OffsetUpdate();
		CountUpdate();
		months.find('a').removeClass("today");
		if(curYear==Date.year()) months.find('a[data-month="'+ Date.month() +'"]').addClass("today");
		next();
	});
	//点击月的选项
	months.find("a").click(function(){
		$(this).addClass("checked").siblings().removeClass("checked");
		curMonth=$(this).data("month");
		CurDateUpdate();
		OffsetUpdate();
		CountUpdate();
		//填充日历内容
		var this1st=new Date(curYear,curMonth-1,1),//本月第一天
			weekday1st=this1st.getDay(),//第一天是星期几（是星期几就说明前边要补充上个月的几天）
			firstDay=this1st.add(-weekday1st,'d'),//日历本页第一天
			str=[],toYear=Date.year(),toMonth=Date.month(),toDay=Date.day()
		;
		do
		{
			var weekday=firstDay.getDay(),
				year=firstDay.getFullYear(),
				month=firstDay.getMonth()+1,
				day=firstDay.getDate()
			;
			
			////////////////////当插入的日期是下个月，且正好是礼拜天时，停止循环
			if((month-curMonth==1 || month==1 && curMonth==12) && !weekday) break;
			////////////////////当插入的日期是下个月，且正好是礼拜天时，停止循环
			
			//如果是礼拜天，插入新一周序号
			if(!weekday) str.push('<u>', firstDay.atWeekOfYear() ,'</u>');
			//本月插入a，非本月插入s
			var tag=month!=curMonth ? 's' : 'a',
				checked=curDay==day,
				today=toYear==year && toMonth==month && toDay==day,
				classname='';
			if(checked && today) classname=' class="checked today"';
			else if(checked) classname=' class="checked"';
			else if(today) classname=' class="today"';
			str.push('<', tag ,' data-day="'+ firstDay.getDate() +'"'+ classname +'>', day ,'</', tag ,'>');
			
			firstDay=firstDay.add(1,'d');
		}while(true);
		
		days.find("i:last").nextAll().remove().end().after(str.join(''));
		next();
	});
	//点击日历中的选项
	days.delegate('a','click',function(){
		$(this).addClass("checked").siblings().removeClass("checked");
		curDay=$(this).data("day");
		CurDateUpdate();
		OffsetUpdate();
		CountUpdate();
	});
	/////////////////////////////////////////////////////日历部分
	/////////////////////////////////////////////////////偏移部分
	var offset=$(".offset",CHIdatePicker);
	var dStart=Date.today(),direction=1,difference=0,cUnit='Y',offsetDate;
	//刷新偏移面板各个位置的当前时间，并重新计算偏移面板上的目标时间（如果以当前时间为起始的话）
	function OffsetUpdate()
	{
		if(curDate)//如果当前时间不为空
		{
			var datestring=curDate.format(PATTERN);
			$(".current",CHIdatePicker).text(datestring)
				.parent().prev("input").prop('disabled',false).filter(":checked").click();
		}
		else
		{
			$(".current",CHIdatePicker).text('')
				.parent().prev("input").prop('disabled',true)
				.prev("label").click();
		}
	}
	//计算偏移时间
	function calculate()
	{
		offsetDate=dStart.add(difference*direction,cUnit);
		$(".OffsetDate",offset).text(offsetDate.format(PATTERN));
	}
	//点击起始中的按钮
	$(":radio[name='CHIdatePicker-from']",offset).click(function(){
		dStart=this.value=='today' ? Date.today() : curDate;
		$("span.start",offset).text(dStart.format(PATTERN));
		calculate();
	}).eq(0).click();
	//点击方向中的按钮
	$(":radio[name='CHIdatePicker-to']",offset).click(function(){
		direction=this.value;
		$("span.direction",offset).text(direction>0 ? '后':'前');
		calculate();
	}).eq(0).click();
	//在偏差中输入内容
	$("input.difference",offset).on('change input propertychange',function(){
		difference=this.value;
		$("span.difference",offset).text(difference);
		calculate();
	}).change();
	//点击单位中的按钮
	$(":radio[name='CHIdatePicker-unit']",offset).click(function(){
		cUnit=this.value;
		$("span.unit",offset).text($(this).next("label").text());
		calculate();
	}).eq(0).click();
	//点击定位到新日期
	$("tfoot p",offset).click(function(){
		curDate=offsetDate;
		curYear=offsetDate.getFullYear();
		curMonth=offsetDate.getMonth()+1;
		curDay=offsetDate.getDate();
		CalendarUpdate();
		topics.eq(0).click();
	});
	/////////////////////////////////////////////////////偏移部分
	/////////////////////////////////////////////////////快捷部分
	$(".quicks a",CHIdatePicker).click(function(){
		var day=Date.today();
		switch(this.className.replace(' short',''))
		{
			case 'LASTKYEARS'://一千年前
				day=day.add(-1000,'y');
				break;
			case 'LASTCENTURY'://一世纪前
				day=day.add(-100,'y');
				break;
			case 'BEFORELAST'://前年
				day=day.add(-2,'y');
				break;
			case 'LASTYEAR'://去年
				day=day.add(-1,'y');
				break;
			case 'LASTMONTH'://上个月
				day=day.add(-1,'mon');
				break;
			case 'LASTWEEK'://上周
				day=day.add(-1,'w');
				break;
			case 'BEFOREYESTERDAY'://前天
				day=day.add(-2,'d');
				break;
			case 'YESTERDAY'://昨天
				day=day.add(-1,'d');
				break;
			case 'TOMORROW'://明天
				day=day.add(1,'d');
				break;
			case 'AFTERTOMORROW'://后天
				day=day.add(2,'d');
				break;
			case 'NEXTWEEK'://下周
				day=day.add(1,'w');
				break;
			case 'NEXTMONTH'://下个月
				day=day.add(1,'mon');
				break;
			case 'NEXTYEAR'://明年
				day=day.add(1,'y');
				break;
			case 'AFTERNEXT'://后年
				day=day.add(2,'y');
				break;
			case 'NEXTCENTURY'://一世纪后
				day=day.add(100,'y');
				break;
			case 'NEXTKYEARS'://一千年后
				day=day.add(1000,'y');
				break;
			default:;//今天
		}
		curDate=day;
		curYear=curDate.getFullYear();
		curMonth=curDate.getMonth()+1;
		curDay=curDate.getDate();
		CurDateUpdate();
		CalendarUpdate();
		OffsetUpdate();
		CountUpdate();
		topics.eq(0).click();
	});
	/////////////////////////////////////////////////////快捷部分
	/////////////////////////////////////////////////////计数部分
	//填充月
	var str=[],counter=$(".counter",CHIdatePicker),countDate;
	for(var n=1;n<13;n++) str.push('<option value="'+ n +'">'+ n +'</option>');
	$(".monthnum",counter).html(str);
	str=null; str=[];
	for(var n=0;n<weekdays.length;n++) str.push('<option value="'+ n +'">'+ weekdays[n] +'</option>');
	$(".weekdaynum",counter).html(str);
	//每点一次label，就将当前面板的计数结果刷新一下
	var counterLabels=$("label",counter).click(function(){
		var index=$(this).index(counter.selector + ' label');
		count(index);
	});
	counterLabels.eq(0).click();
	$("label",counter).find("input,select").on('change input propertychange',function(event){
		var label=$(this).closest("label"),
			index=label.index(counter.selector + ' label');
		count(index);
	});
	function count(labelIndex)
	{
		var label=counterLabels.eq(labelIndex),
			option={};
		switch(labelIndex)
		{
			case 0:
				option={
					year:$(".yearnum",label).val(),
					num:$(".daynum",label).val()
				};
				break;
			case 1:
				option={
					year:$(".yearnum",label).val(),
					month:$(".monthnum",label).val(),
					num:$(".daynum",label).val()
				};
				break;
			case 2:
				option={
					year:$(".yearnum",label).val(),
					week:$(".weeknum",label).val(),
					weekday:$(".weekdaynum",label).val()
				};
				break;
			case 3:
				option={
					year:$(".yearnum",label).val(),
					num:$(".weeknum",label).val(),
					weekday:$(".weekdaynum",label).val()
				};
				break;
			case 4:
				option={
					year:$(".yearnum",label).val(),
					month:$(".monthnum",label).val(),
					num:$(".weeknum",label).val(),
					weekday:$(".weekdaynum",label).val()
				};
				break;
			case 5:
				option={
					year:$(".yearnum",label).val(),
					month:$(".monthnum",label).val(),
					week:$(".weeknum",label).val(),
					weekday:$(".weekdaynum",label).val()
				};
				break;
		}
		try{
			countDate=Date.getDate(option);
			$(".CountDate",counter).text(countDate.format(PATTERN));
		}catch(e){
			$(".CountDate",counter).text("日期超出范围");
		}
	}
	//点击定位到新日期
	$("p:last",counter).click(function(){
		curDate=countDate;
		curYear=curDate.getFullYear();
		curMonth=curDate.getMonth()+1;
		curDay=curDate.getDate();
		CalendarUpdate();
		CountUpdate();
		topics.eq(0).click();
	});
	//填充计数面板所有组件
	function CountUpdate()
	{
		var counter=$(".counter",CHIdatePicker),
			weekday=countDate.getDay();
		$(".yearnum",counter).val(countDate.getFullYear());
		$(".monthnum",counter).val(countDate.getMonth()+1);
		$(".weekdaynum",counter).val(countDate.getDay());
		$('label[for="CHIdatePicker-YearNumDay"] .daynum',counter).val(countDate.atDayOfYear());
		$('label[for="CHIdatePicker-YearMonthNumDay"] .daynum',counter).val(countDate.getDate());
		$('label[for="CHIdatePicker-YearNumWeekWeekday"] .weeknum',counter).val(countDate.atWeekOfYear());
		$('label[for="CHIdatePicker-YearNumWeekday"] .weeknum',counter).val(countDate.atWeekdayOfYear()[0]);
		$('label[for="CHIdatePicker-YearMonthNumWeekday"] .weeknum',counter).val(countDate.atWeekdayOfMonth()[0]);
		$('label[for="CHIdatePicker-YearMonthNumWeekWeekday"] .weeknum',counter).val(countDate.atWeekOfMonth());
		$(".CountDate",counter).text(countDate.format(PATTERN));
	}
	/////////////////////////////////////////////////////计数部分
	$("a",CHIdatePicker).removeAttr('href');
	$("a,input[type=button]",CHIdatePicker).focus(function(){this.blur()});
	//点击尾部的日期部分，可以切换年/月/日面板，如果日期为空则滚动到千年面板
	tipYear.click(function(){
		topics.eq(0).click();
		show(curYear ? 3 : 0);
	});
	tipMonth.click(function(){
		topics.eq(0).click();
		show(curYear ? 4 : 0);
	});
	tipDay.click(function(){
		topics.eq(0).click();
		if(curYear && curMonth) months.find(".checked").click();
		else show(0);
	});
	//点击确定
	$(".submit",CHIdatePicker).click(function(){
		var date=new Date(curYear,curMonth-1,curDay),
			str=date.format('{YYYY}-{MM}-{DD}');
		$(CURRENTINPUT).val(str)
			.siblings("span").text(str);

		CHIdatePicker.close();
	});
	//点击标题上的叉
	$(".tabs q",CHIdatePicker).click(function(){
		CHIdatePicker.close();
	});
	//点击留空
	$(".empty",CHIdatePicker).click(function(){
		$(CURRENTINPUT).val('')
			.siblings("span").text('');
		curYear=curMonth=curDay=curDate='';
		CHIdatePicker.close();
	});
	/////////////////////////////////////////////////////////////////////////////////////////公用方法
	//监听某个文本域，可以获取及设置其值（储存图标类名列表）
	CHIdatePicker.focus=function(DOMinput){
		if(!DOMinput.tagName || DOMinput.tagName.toLowerCase()!='input')return false;
		CURRENTINPUT=DOMinput;
		function open(){
			$(".FullScreen").fadeIn(function(){
				topics.eq(0).click();
				getTime();
				CHIdatePicker.fadeIn();
			}).find("td").eq(0).children().hide();
		}
		if(typeof CHIbg=='undefined') open();
		else CHIbg.open(open);
	}
	CHIdatePicker.close=function(){
		this.fadeOut(function(){
			$(".FullScreen").fadeOut();
			if(typeof CHIbg!='undefined') CHIbg.close();
		});
	}
})();
$(function(){
	function IsPC() {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
		var flag = true;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break;
			}
		}
		return flag;
	}
	//日期选择器
	$("label.CHIdates").each(function(){
		if(!$(this).data("value")) $(this).data('value','');
		var value=$(this).data("value"),
			date=new Date(value),
			i=$('<i class="fa fa-calendar"></i>').appendTo(this),
			span=$('<span>'+ (date.error() ? '' : value) +'</span>').appendTo(this),
			input=$('<input type="hidden" value="'+ value +'">').appendTo(this);
		$(this).removeData('value');
	})
	
	$("body").on((IsPC() ? 'click':'touchend'),'label.CHIdates',function(){
		CHIdatePicker.focus($(this).find("input").get(0));
	});
});
