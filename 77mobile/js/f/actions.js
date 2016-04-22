//带有异步数据处理的行为
var CHIcommonSave=function(){//常规的同步提交到保存页的动作
	$.ajax({
		url:"save.php"
		,type:"POST"
		,data:$("form:first-of-type").serialize()
		,success:function(data){
			eval("CHIalarm."+data+";");
		}
		,error:ajaxError
		,async:true
	});
}
var CHIspecialSave=function(){//带有files文件域的同步提交到保存页的动作
	$("form:first-of-type").ajaxSubmit(function(data){
		eval("CHIalarm."+data+";");
	});
	return false;
}
function quit()//页眉上的退出动作
{
	var mes=_words('really,quit');
	var fun=function(){
		$.ajax({
			url:rootPath+'logout.php'
			,success:function(){
				jump(rootPath+"login.php");
			}
			,error:ajaxError
			,complete:ajaxClose
		});
	}
	CHIalarm.ask(mes,fun);
}
function language(id)//异步切换语种
{
	$.ajax({
		url:rootPath+'language.php?id='+id
		,success:function(){
			fresh();
		}
		,error:ajaxError
		,complete:ajaxClose
	});
}
//批量处理行为的预备动作，附加表需要参数lan，否则就只处理主表的信息
function batchAction(action,lan)
{
	var f/*form*/=$("form:first-of-type");
	var mes,fun;
	if(!f.size()){//要存在一个唯一的表单
		mes=_words('form,not,exist');
		CHIalarm.say(mes,'error');
		return false;
	}
	if(!checkIDS()){//除了排序之外，其它操作要有ids被选
		mes=_words('no,item,checked');
		CHIalarm.say(mes,'error');
		return false;
	}
	var ids=vals('ids[]');
	eval('record'+ucfirst(action)+'("'+ids+'",'+lan+')');
}

function recordMove(id)
{
	var mes=_words('really,move');
	var succeed=function(data){
		eval("var obj="+data+";");
		CHIalarm.focus(obj);
	}
	var confun=function(){
		$.ajax({
			url:"move.php?id="+id
			,success:succeed
			,error:ajaxError
			,async:true
		});
	};
	function move()
	{//正式的移动
		var goalid=$("#CHIalarm dd select:last-of-type").val()
		$.ajax({
			url:"move.php?id="+id+"&par="+goalid+"&menu="+goalid
			,success:function(data){
				eval("CHIalarm."+data+";");
			}
			,error:ajaxError
			,async:true
		});
	}
	CHIalarm.ask(mes,confun);
}

function recordHide(id,lan){recordAction('hide',id,lan);}
function recordShow(id,lan){recordAction('show',id,lan);}
function recordDel(id,lan){recordAction('del',id,lan);}
function recordPush(id,lan){recordAction('push',id,lan);}
function recordPull(id,lan){recordAction('pull',id,lan);}
function recordAction(action,id,lan)
{
	var the=!str_int.test(id) && id.indexOf(',')?"these":"this";
	var mes=_words('really,'+action+','+the+',record');
	var con=function(){
		$.ajax({
			url:action+'.php?id='+id+"&lan="+lan
			,success:function(data){
				eval("CHIalarm."+data+";");
			}
			,error:ajaxError
			,complete:ajaxClose
			,async:true
		});
	}
	CHIalarm.ask(mes,con);
}


/*
obj是设置参数对象
type，排序的类型
	缺省：按填写的数字排序
	zero：所有顺序置零
	sort：按出现的顺序排序
	id：按ID排序
formid，被排序的表单，默认为页面第一个表单
ordername，接受顺序的order框组名，默认为orders[]
tip，关于排序的方式说明
idname，存放记录id的框组名，当type=id时起效，默认为ids[]
*/
function BatchOrder(obj)
{
	var type,formid,ordername,idname;
	type=(obj && "type" in obj)?obj.type:0;
	formid=(obj && "formid" in obj)?"#"+obj.formid:"form:first-of-type";
	ordername=(obj && "ordername" in obj)?obj.ordername:"orders[]";
	idname=(obj && "idname" in obj)?obj.idname:"ids[]";
	tip=(obj && "tip" in obj)?obj.tip:"";
	try
	{
		if(!$(formid).size()) throw "form,not,exist";
		var orders=document.getElementsByName(ordername);
		for(var i=0;i<orders.length;i++)
		{
			if(!str_int_pos.test(orders[i].value))
			{
				CHIalarm.error(_words("order,must,be,pos,int"),function(){orders[i].focus();});
				return false;
			}
		}
		var ids=document.getElementsByName(idname);
		if(!orders.length || !ids.length) throw "para,error";
		CHIalarm.ask(_words('really,order')+' => '+tip,doSort);
	}
	catch(e)
	{
		CHIalarm.error(_words(e));
		return false;
	}
	function doSort()
	{
		switch(type)
		{
			case "sort":
				for(var i=0;i<orders.length;i++)
				{
					var t=$(orders[i]);
					t.val(t.parentsUntil("ul").last().index()+1);
				}
				break;
			case "id":
				for(var i=0;i<orders.length;i++)
					$(orders[i]).val($(ids[i]).val());
				break;
			case "zero":
				$(orders).val(0);
				break;
		}
		$.post('order.php',$(formid).serialize(),function(data){
			eval("CHIalarm."+data+";");
		}).error(ajaxError)
		.complete(ajaxClose);
	}
}
//通用的常规查找功能，点页脚“查找”，先询问，是否要查找（显示本表的查找提示），确定后询问输入关键字，点击确认后查找
function askSearch(tablename)
{
	var mes=_words('really,search,these,record')+'?'+BR+_words(tablename+'SearchTip');
	var input=function(){
		var inmes=_words('please,input,keyword')+BR+'<input type="text" name="keyword" id="keyword" required="required" />';
		var seek=function(){
			if(str_empty.test(val('keyword')))
			{
				CHIalarm.error(_words('keyword,cant,be,empty'),input);
			}
			else jump(RebuildGet({"keyword":val("keyword")}));
		}
		CHIalarm.ask(inmes,seek);
		reach("keyword");
	}
	CHIalarm.ask(mes,input);
}
//异步删除顶图，就是单一的上传图片的位置
function deletePhoto(src,tb,id)
{
	var delfun=function(){
		var url="../incs/ajax/deletePhoto.php?src=" + src + "&tb=" + tb + "&id=" + id
		$.ajax({
			url:url
			,error:ajaxError
			,complete:ajaxClose
			,success:function(data){
				eval("CHIalarm."+data+";");
			}
		});
	}
	CHIalarm.ask(_words('really,del,photo'),delfun);
}