/*
一定是基于scrollbar上的属性的，无法单独使用
将属性拆分成带有width，color，style的子属性
用于border及borderXXX，outline
*/
define(function(require,exports,module){
	var N=require("./N"),
		C=require("./C");
	return function (database)
	{
		var attr=this.name,
			BAR=this.BAR,
			value=database[attr],
			arr=value===null ? [null] : value.split(' '),
			parts=this.parts,
			obj={};

		//删除总属性，将子属性放进去
		delete(database[attr]);
		for(var n in parts)
		{
			var sa=parts[n];
			if(!(sa in BAR)) console.error(sa,"属性不存在于插件中！");
			else obj[sa]=null;
		}
		for(var n in arr)
		{
			var v=arr[n],name='';
			if(!isNaN(v) || N.type(v)) name='Width';
			else if(C.type(v)) name='Color';
			else name='Style';
			obj[attr+name]=v;
		}
		for(var n in obj)
		{
			database[n]=obj[n];
			BAR[n].parse(database);
		}
		obj=arr=null;
	}
});