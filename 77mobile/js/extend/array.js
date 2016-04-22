//对Javascript的Array类型的扩展
if (!Array.prototype.indexOf) //低端浏览器，没有Array.indexOf()函数
Array.prototype.indexOf = function(ele) {
	for (var n = 0; n < this.length; n++)
	if (ele === this[n]) return n;
	return -1;
}
if (!Array.prototype.lastIndexOf) //低端浏览器，没有Array.lastIndexOf()函数
Array.prototype.lastIndexOf = function(ele) {
	for (var n = this.length - 1; n >= 0; n--)
	if (ele === this[n]) return n;
	return -1;
}
Array.prototype.has = function(ele) { //判断元素ele是否在数组中
	return this.indexOf(ele) >= 0;
}
Array.prototype.unique = function() { //清除本数组中（后续的）重复的元素，返回清除的个数
	var cnt = 0;
	for (var n = this.length - 1; n >= 0; n--) {
		if (this.indexOf(this[n]) != n) {
			this.splice(n, 1);
			cnt++;
		}
	}
	return cnt;
}
Array.prototype.union = function(arr) { //返回本数组与另一数组的合集
	var newArr = [];

	function trav(array) {
		for (var n = 0; n < array.length; n++)
		if (!newArr.has(array[n])) newArr.push(array[n]);
	}
	trav(this);
	trav(arr);
	return newArr;
}
Array.prototype.intersect = function(arr) { //返回本数组与另一数组的交集
	if (!(arr instanceof Array)) return undefined;
	var newarr = [],
		iterator, reference;
	if (this.length > arr.length) {
		iterator = arr;
		reference = this;
	} else {
		iterator = this;
		reference = arr;
	}
	for (var i = 0; i < iterator.length; i++) {
		var it = iterator[i];
		if (reference.has(it)) newarr.push(it);
	}
	return newarr;
}
Array.prototype.substract = function(arr) { //返回本数组与另一数组的差集
	if (!(arr instanceof Array)) return undefined;
	var newarr = [];
	for (var i = 0; i < this.length; i++) {
		var it = this[i];
		if (!arr.has(it)) newarr.push(it);
	}
	return newarr;
}
Array.prototype.xor = function(arr) { //返回本数组与另一数组的异或集
	if (!(arr instanceof Array)) return undefined;
	var newarr = [],
		old = this;

	function trav(array) {
		for (var i = 0; i < array.length; i++) {
			var it = array[i];
			if (!(old.has(it) && arr.has(it))) newarr.push(array[i]);
		}
	}
	trav(this);
	trav(arr);
	return newarr;
}
Array.prototype.contain = function(arr) { //判断本数组是否包含另一数组
	if (!(arr instanceof Array)) return undefined;
	if (arr.length > this.length) return false;
	for (var i = 0; i < arr.length; i++)
	if (!this.has(arr[i])) return false;
	return true;
}
Array.prototype.inside = function(arr) { //判断本数组是否包含于另一数组
	if (!(arr instanceof Array)) return undefined;
	if (arr.length < this.length) return false;
	for (var i = 0; i < this.length; i++)
	if (!arr.has(this[i])) return false;
	return true;
}
Array.prototype.min = function() { //返回数组中最小值
	if (!this.length) return undefined;
	var x = this[0];
	for (var n = 0; n < this.length; n++)
	if (this[n] < x) x = this[n];
	return x;
}
Array.prototype.max = function() { //返回数组中最大值
	if (!this.length) return undefined;
	var x = this[0];
	for (var n = 0; n < this.length; n++)
	if (this[n] > x) x = this[n];
	return x;
}
Array.prototype.insert = function(ind, ele) { //向数组中插入元素，返回新的长度
	this.splice(ind, 0, ele);
	return this.length;
}
Array.prototype.remove = function(ele) { //从数组中删除某个元素，可能是若干个，返回删除的元素的个数
	var index, cnt = 0;
	while (true) {
		index = this.indexOf(ele);
		if (index < 0) break;
		this.splice(index, 1);
		cnt++;
	}
	return cnt;
}
Array.prototype.clone = function() { //返回本数组的副本，不深拷贝元素
	var arr = [];
	for (var n = 0; n < this.length; n++)
	arr[n] = this[n];
	return arr;
}
Array.prototype.traverse = Array.prototype.map = function(fun) { //深度遍历元素
	for (var n = 0; n < this.length; n++) {
		var a = this[n];
		if (isArr(a)) a.traverse(fun);
		else fun(n, a);
	}
}
Array.prototype.random = function() { //随机取元素
	var l = this.length;
	var x = Math.floor(Math.random() * l);
	return this[x];
}
Array.prototype.asc = function() { //升序排序
	this.sort(function(a, b) {
		return a - b;
	});
}
Array.prototype.desc = function() { //降序排序
	this.sort(function(a, b) {
		return b - a;
	});
}
/*
将一维字符串数组，使用nums数字序列串联起来
当nums是数字序列时，依次按照元素的索引及nums上的数字来取子字符
nums可以是一个长数字，最多使用到Z（按36进制算，不为负）
nums也可以是一个逗号数字串，或数字数组（按10进制算，可以为负）
只返回与nums或本数组长度较小的相同长度的字符，如果字符串数组不够长，则只返回取到的部分

如果某个num超过了对应字符串的长度，则添加一个空格
返回连接后的字符串
*/
Array.prototype.weave = function(nums) {
	if (!nums) return false;
	var arr = [],
		strs = [];

	function chars() {
		var reg = /^[0-9a-z]$/i;
		//低端不支持String[n]来访问字符
		for (var n = 0; n < nums.length; n++) {
			var char = nums.charAt(n);
			if (!reg.test(char)) return false;
			arr.push(parseInt(char, 36));
		}
	}
	if (typeof nums == 'number') {
		if (Math.round(nums) != nums) return false;
		nums = nums.toString();
		chars();
	} else if (typeof nums == 'string') {
		if (nums.indexOf(',') > 0) arr = nums.split(',');
		else chars();
	} else if (nums instanceof Array) arr = nums;
	else return false;

	for (var n = 0; n < Math.min(arr.length, this.length); n++) {
		var x = arr[n],
			str = this[n].toString();
		if (parseInt(x) != x) return false;
		if (x > str.length) strs.push('');
		else strs.push(str.charAt(x));
	}
	return strs.join('');
}