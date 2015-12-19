/*
预置的parse函数，只能用于基本属性，单值
属性需要验证合法性，不合法的属性将会被从数据对象中删除
如果是null的话，则是从终值解析而来（未得到对应的数值），这种值将会在对比时，使用初值
目前暂时没想到（基本属性）会为空的情况，只有border属性，在四个边框不一样时会返回空
*/

define(function(require,exports,module){
	return function(database){
		var attr=this.name,
			value=database[attr],
			isnull=value===null;
		if(this.BAR.check(attr,value) || isnull)
		{
			//database[attr]=isnull ? this.defaultvalue : value;
			return true;
		}
		else
		{
			delete(database[attr]);
			console.error("属性",attr,"的值",value,"不合法……")
			return false;
		}
	}
});