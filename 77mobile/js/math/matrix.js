/*
矩阵类
参数：
	row，必选，正整数，矩阵的行数
	col，必选，正整数，矩阵的列数
属性：
	.row，正整数，矩阵的行数
	.col，正整数，矩阵的列数
	.size，正整数，矩阵的元素总数
方法：
	.set()，设置矩阵的元素，其中，参数可以使用
		1.一系列数字
		2.一个一维数组
		3.一个二维数组
		4.一个矩阵对象
		*****如果元素数量不同，则返回undefined
	.getR(r)，返回数组，为指定的一行元素，参数必选，从0到row
	.getC(c)，返回数组，为指定的一列元素，参数必选，从0到col
	.matrix()，返回字符串，以\n及\t显示矩阵
	.toString()，返回元素序列，如同Array.toString()一样
	.T()，返回本矩阵的转置矩阵
	.add(m)，返回本矩阵与参数的加法矩阵，参数必须是矩阵对象
	.plus(m)，add方法的别名
	.times(n)，返回本矩阵与参数的数乘矩阵，参数必须是数字
	.minus(m)，返回本矩阵与参数的减法矩阵，参数必须是矩阵对象
	.substract(m)，minus方法的别名
	.pre(m)，返回本矩阵左乘参数的结果矩阵，参数必须是矩阵对象
	.premultiply(m)，pre方法的别名
	.post(m)，返回本矩阵右乘参数的结果矩阵，参数必须是矩阵对象
	.postmultiply(m)，post方法的别名
	
*/
function CHImatrix(row,col)
{
	if(!isPosInt(row) || col!==undefined && !isPosInt(col))return undefined;
	if(col===undefined)col=row;
	var o=new Array();
	o.row=row;
	o.col=col;
	o.size=row*col;
	for(var n=0;n<row;n++) o[n]=new Array(col);
	
	o.set=function(){//设置元素
		var arg=arguments,r=o.row,c=o.col;
		if(isNaN(arg[0]))
		{
			if(isArr(arg[0])) arg=arg[0].toString().split(',');
			else if(isMatrix(arg[0]))
			{
				if(arg[0].row!=o.row || arg[0].col!=o.col) return undefined;
				arg=arg[0].toString().split(',');
			}
			else return undefined;
		}
		if(arg.length!=r*c)return false;
		for(var i=0;i<r;i++)
			for(var j=0;j<c;j++)
			{
				if(arg[i*c+j]==undefined)break;
				this[i][j]=arg[i*c+j];
			}
		return o;
	}
	o.getR=o.getRow=function(r){//获取一行元素
		if(!isNat(r) || r>=o.row)return undefined;
		var a=[];
		for(var j=0;j<o.col;j++) a[j]=o[r][j];
		return a;
	}
	o.getC=o.getCol=function(c){//获取一列元素
		if(!isNat(c) || c>=o.col)return undefined;
		var a=[];
		for(var i=0;i<o.row;i++) a[i]=o[i][c];
		return a;
	}
	o.matrix=function(){//可以书写的模式
		var s='';
		for(var i=0;i<o.row;i++)
		{
			for(var j=0;j<o.col;j++)
			{
				if(j)s+=',\t';
				s+=fix(o[i][j],4);
			}
			s+='\n';
		}
		return s;
	}
	o.toString=function(){//与数组一样返回纯字符串
		var arr=[];
		for(var i=0;i<o.row;i++)
			for(var j=0;j<o.col;j++)
				arr.push(o[i][j]);
		return arr.toString();
	}
	o.T=function(){//矩阵转置，返回新矩阵
		var m=CHImatrix(o.col,o.row);
		for(var i=0;i<o.row;i++)
			for(var j=0;j<o.col;j++)
				m[j][i]=o[i][j];
		return m;
	}
	o.add=o.plus=function(m){//矩阵加法，行数列数必须对应相等，返回新矩阵
		if(!isMatrix(m) || o.row!=m.row || o.col!=m.col)return undefined;
		var n=CHImatrix(o.row,o.col);
		for(var i=0;i<o.row;i++)
			for(var j=0;j<o.col;j++)
				n[i][j]=o[i][j]+m[i][j];
		return n;
	}
	o.times=function(n){//矩阵数乘，返回新矩阵
		n=num(n);
		var m=CHImatrix(o.row,o.col);
		for(var i=0;i<o.row;i++)
			for(var j=0;j<o.col;j++)
				m[i][j]=n*o[i][j];
		return m;
	}
	o.minus=o.substract=function(m){//矩阵减法，返回新矩阵
		if(!isMatrix(m) || o.row!=m.row || o.col!=m.col)return undefined;
		var n=CHImatrix(o.row,o.col);
		for(var i=0;i<o.row;i++)
			for(var j=0;j<o.col;j++)
				n[i][j]=o[i][j]-m[i][j];
		return n;
	}
	o.pre=this.premultiply=function(m){//矩阵左乘，本矩阵×参数矩阵，返回新矩阵
		if(!isMatrix(m) || o.col!=m.row)return undefined;
		var z=m.row,r=o.row,c=m.col,n=CHImatrix(r,c);
		for(var i=0;i<r;i++)
			for(var j=0;j<c;j++)
			{
				var aR=o.getR(i);
				var aC=m.getC(j);
				n[i][j]=sigma(0,z-1,function(x){
					return aR[x]*aC[x];
				});
			}
		return n;
	}
	o.post=o.postmultiply=function(m){//矩阵右乘，参数矩阵×本矩阵，返回新矩阵
		return isMatrix(m) ? m.pre(o) : undefined;
	}
	o.constructor=CHImatrix;
	return o;
}
isMatrix=function(o){return o.constructor==CHImatrix;}
