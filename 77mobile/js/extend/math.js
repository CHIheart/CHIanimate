//对Javascript的Math对象的扩展
//测试变量是否是整数，只测试2/8/10/16进制整数
Math.isInt = function(n) {
	return /^[\+\-]?[\d]+$/.test(n) || /^0[0-7]+$/.test(n) || /^[01]+$/.test(n) || /^[0-9a-f]+$/i.test(n);
}
//返回正负1或0
Math.sign = function(n) {
	return isNaN(n) ? NaN : (n > 0 ? 1 : (n < 0 ? -1 : 0));
}
//求N次方根
Math.root = function(x, n) {
	return isNaN(n) || isNaN(x) ? NaN : Math.pow(x, 1 / n);
}
//弧度转角度
Math.t2a = function(t) {
	return isNaN(t) ? NaN : t / PI * 180;
}
//角度转弧度
Math.a2t = function(a) {
	return isNaN(a) ? NaN : a * PI / 180;
}
//将小数n，保留bit位小数
Math.fix = function(n, bit) {
	if (isNaN(bit) || isNaN(n)) return NaN;
	var p = Math.pow(10, bit);
	return Math.round(n * p) / p;
}
//范围内的随机整数
Math.range = function(m, n) {
	if (isNaN(m) || isNaN(n)) return NaN;
	var x = Math.min(m, n),
		y = Math.max(m, n);
	return Math.floor(Math.random() * (y - x)) + x;
}
//最大公约数highest common factor
Math.HCF = function(m, n) {
	if (isNaN(m) || isNaN(n)) return NaN;
	var a = Math.max(m, n),
		b = Math.min(m, n);
	return a % b ? Math.HCF(b, a % b) : b;
}
//最小公倍数least common multiple
Math.LCM = function(m, n) {
	if (isNaN(m) || isNaN(n)) return NaN;
	return m * n / Math.HCF(m, n);
}
//求若干个数的平方和的算术平方根，参数可以是一列数字，或一个数字的一维数组
Math.module = function() {
	var arr = arguments;
	if (!arr.length) return 0;
	if (arr[0] instanceof Array) arr = arr[0];
	var n = 0;
	for (var x in arr) n += Math.pow(arr[x] * 1.0, 2);
	return Math.sqrt(n);
}
//求和，m跟n只能用整数，fun只能用需要一个参数的有返回值的函数，或者为空（求累加）
Math.sigma = function(m, n, fun) {
	if (!Math.isInt(m) || !Math.isInt(n)) return NaN;
	var a = Math.max(m, n),
		b = Math.min(m, n),
		s = 0;
	if (!(fun instanceof Function)) fun = function(x) {
		return x;
	}
	for (var x = b; x <= a; x++) {
		var t = fun(x);
		if (t === undefined || isNaN(t)) return NaN;
		s += fun(x) * 1.0;
	}
	return s;
}
//阶乘，n只能使用十进制正整数
Math.factorial = function(n) {
	if (!/^[\+]?[\d]+$/.test(n)) return NaN;
	return n == 1 ? 1 : Math.factorial(n - 1) * n;
}
//斐波那切数列，n只能使用正整数
Math.Fibonacci = function(n) {
	if (!/^[\+]?[\d]+$/.test(n)) return NaN;
	if (n == 1 || n == 2) return 1;
	else return Math.Fibonacci(n - 1) + Math.Fibonacci(n - 2);
}