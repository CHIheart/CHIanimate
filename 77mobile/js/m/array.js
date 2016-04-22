//将数组作为集合运算使用
if(!isArray) var isArray=function(n){return n instanceof Array;}
//低端浏览器，没有Array.indexOf()函数
if(!Array.prototype.indexOf)
Array.prototype.indexOf=function(ele){
	for(var n=0; n<this.length; n++)
	{
		if(ele===this[n]) return n;
	}
	return -1;
}
//判断元素ele是否在数组中
Array.prototype.has=function(ele){
	return this.indexOf(ele)>=0;
}
//本数组与另一数组的交集
Array.prototype.intersect=function(arr){
	if(!isArray(arr))return undefined;
	var newarr=[];
	var iterator,reference;
	if(this.length > arr.length)
	{
		iterator=arr;
		reference=this;
	}
	else
	{
		iterator=this;
		reference=arr;
	}
	for(var i=0; i<iterator.length; i++)
	{
		var it=iterator[i];
		if(reference.has(it)) newarr.push(it);
	}
	return newarr;
}
//本数组与另一数组的差集
Array.prototype.substract=function(arr){
	if(!isArray(arr))return undefined;
	var newarr=[];
	for(var i=0; i<this.length; i++)
	{
		var it=this[i];
		if(!arr.has(it)) newarr.push(it);
	}
	return newarr;
}
//本数组与另一数组的异或集
Array.prototype.xor=function(arr){
	if(!isArray(arr))return undefined;
	var newarr=[];
	var old=this;
	function trav(array)
	{
		for(var i=0; i<array.length; i++)
		{
			var it=array[i];
			if(!(old.has(it) && arr.has(it)))
			newarr.push(array[i]);
		}
	}
	trav(this);
	trav(arr);
	return newarr;
}
//判断本数组是否包含另一数组
Array.prototype.contain=function(arr){
	if(!isArray(arr))return undefined;
	if(arr.length > this.length)return false;
	for(var i=0; i<arr.length; i++)
	{
		if(!this.has(arr[i]))return false;
	}
	return true;
}
//判断本数组是否包含于另一数组
Array.prototype.inside=function(arr){
	if(!isArray(arr))return undefined;
	if(arr.length < this.length)return false;
	for(var i=0; i<this.length; i++)
	{
		if(!arr.has(this[i]))return false;
	}
	return true;
}