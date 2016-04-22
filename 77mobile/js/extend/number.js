//对JavaScript的Number类型的扩展
//数的位数
Number.prototype.bits = function() {
	return String(this).length;
}
//数制转换，转成字符串
Number.prototype.dec = function() {
	return this.toString(10);
}
Number.prototype.bin = function() {
	return this.toString(2);
}
Number.prototype.oct = function() {
	return this.toString(8);
}
Number.prototype.hex = function() {
	return this.toString(16);
}
//各种方式的估算
Number.prototype.fix = Number.prototype.toFixed;
Number.prototype.round = function() {
	return Math.round(this);
}
Number.prototype.ceil = function() {
	return Math.ceil(this);
}
Number.prototype.floor = function() {
	return Math.floor(this);
}
//数的符号
Number.prototype.sign = function() {
	return this > 0 ? 1 : (this < 0 ? -1 : 0);
}
//数的开方，无法开负数方（虽然理论上负数有奇数次方根）
Number.prototype.sqrt = function() {
	return Math.sqrt(this);
}
Number.prototype.root = function(n) {
	return isNaN(n) ? NaN : Math.pow(float(x), 1 / float(n));
}
//数字补位，返回字符串，bit为希望的最小位数，char默认为0，是补数的字符，suffix默认为false，向前补足，为true则向后补足
Number.prototype.pad = function(bit, char, suffix) {
	if (isNaN(bit)) return NaN;
	if (!char) char = '0';
	var num = this.bits(),
		strArray = [this];
	while (num < bit) {
		if (suffix) strArray.push(char);
		else strArray.unshift(char);
		num++;
	}
	return strArray.join('');
}