//对JavaScript的String类型的扩展
String.prototype.left = function(n) { //左取子串，参数默认为1
	if (!n) n = 1;
	return this.substr(0, n);
}
String.prototype.right = function(n) { //右取子串，参数默认为1
	if (!n) n = 1;
	return this.substring(this.length - n);
}
String.prototype.ucfirst = function() { //首字母大写
	return [this.charAt(0).toUpperCase(), this.substring(1)].join('');
}
String.prototype.replaceAll = function(oldstr, newstr) { //全局替换
	var reg = new RegExp(oldstr, "g");
	if (!newstr) newstr = '';
	return this.replace(reg, newstr);
}
//数制的判断及转换
String.prototype.isDEC = function() {
	return /^[\+\-]?[\d]+$/.test(this);
}
String.prototype.isBIN = function() {
	return /^[01]+$/.test(this);
}
String.prototype.isOCT = function() {
	return /^0[0-7]+$/.test(this);
}
String.prototype.isHEX = function() {
	return /^[0-9a-f]+$/i.test(this);
}
String.prototype.bin2oct = function() {
	return parseInt(this, 2).toString(8);
}
String.prototype.bin2dec = function() {
	return parseInt(this, 2).toString(10);
}
String.prototype.bin2hex = function() {
	return parseInt(this, 2).toString(16);
}
String.prototype.oct2bin = function() {
	return parseInt(this, 8).toString(2);
}
String.prototype.oct2dec = function() {
	return parseInt(this, 8).toString(10);
}
String.prototype.oct2hex = function() {
	return parseInt(this, 8).toString(16);
}
String.prototype.dec2bin = function() {
	return parseInt(this, 10).toString(2);
}
String.prototype.dec2oct = function() {
	return parseInt(this, 10).toString(8);
}
String.prototype.dec2hex = function() {
	return parseInt(this, 10).toString(16);
}
String.prototype.hex2bin = function() {
	return parseInt(this, 16).toString(2);
}
String.prototype.hex2oct = function() {
	return parseInt(this, 16).toString(8);
}
String.prototype.hex2dec = function() {
	return parseInt(this, 16).toString(10);
}
//字符补缺，bit为希望的最小位数，char为补充字符，默认为空格，suffix默认为false，向前补足，为true则向后补足
String.prototype.pad = function(bit, char, suffix) {
	if (isNaN(bit)) return NaN;
	if (!char) char = ' ';
	var num = this.length,
		strArray = [this];
	while (num < bit) {
		if (suffix) strArray.push(char);
		else strArray.unshift(char);
		num++;
	}
	return strArray.join('');
}
String.prototype.nl2br = function() { //将转行符换成HTML换行符
	return this.replaceAll("\u000a", "<br>");
}
/*
使用非负数序列将字符分割，如果出现0，则生成一个空串
如果是一个纯数字字符串，则按每位分割，最多可以使用到字母Z（按36进制算）
如果是数字的逗号列表或数组，则按各数字分割（按10进制算）
如果数字序列不够长，则最后元素为所有剩余字符
返回字符串数组，其中只要有一个不符合的数字，则返回false
*/
String.prototype.token = function(nums) {
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

	var index = 0;
	for (var n = 0; n < arr.length; n++) {
		var x = arr[n];
		if (parseInt(x) != x) return false;
		if (x > 0) strs.push(this.substr(index, x));
		else strs.push('');
		index += x;
		if (index >= this.length) break;
	}
	return strs;
}
//按固定字符数将字符串分割成数组，正数从左割，负数从右割
String.prototype.splits = function(num) {
	if (!num || parseInt(num) != num) return false;
	var arr = [],
		index;
	if (num > 0) {
		index = 0;
		for (var n = 0; n < this.length; n += num) {
			arr.push(this.substr(index, num));
			index += num;
			if (index >= this.length) break;
		}
	} else {
		index = this.length + num;
		for (var n = index; n >= 0; n += num) {
			arr.push(this.substr(index, -num));
			index += num;
			if (index <= 0) {
				arr.push(this.substr(0, index - num));
				break;
			}
		}
	}
	return arr;
}