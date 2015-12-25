/*
一定是基于scrollbar上的属性的，无法单独使用
将属性拆分成带有top，right，bottom，left的子属性
用于borderColor，borderWidth，borderStyle，padding，margin
*/
define(function(require,exports,module){
	return function (database,selector)
	{
		var attr=this.name,
			BAR=this.BAR,
			TRBL='Top,Right,Bottom,Left'.split(','),
			value=database[attr],
			parts=this.parts,
			arr=value===null ? [null] : value.split(' '),
			obj={};

		//删除总属性，将子属性放进去
		delete(database[attr]);
		switch(arr.length)
		{
			case 1: arr.push(arr[0],arr[0],arr[0]); break;
			case 2: arr.push(arr[0],arr[1]); break;
			case 3: arr.push(arr[1]); break;
			case 4: break;
			default:
				console.log(attr,"值元素个数错误！")
				return false;
		}
		for(var n in TRBL)
		{
			var sa=attr.replace(/(border|padding|margin)/,'$1'+TRBL[n]);
			if(!(sa in BAR)) console.error(sa,"属性不存在于插件中！");
			else obj[sa]=arr[n];
		}
		for(var n in obj)
		{
			database[n]=obj[n];
			BAR[n].parse(database);
		}
		obj=arr=TRBL=parts=BAR=null;
	}
});