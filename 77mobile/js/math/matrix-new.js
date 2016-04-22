//方型矩阵对象，所有数学习惯以脚标从0开始，需要包含math.js
(function(){
	function CHImatrix(steps)
	{
		if(isNaN(steps) || steps<=0 || !isInt(steps))return false;
		this.steps=steps;
		//最开始先生成全单位矩阵
		for(var m=0;m<steps;m++)
		{
			this[m]=[];
			for(var n=0;n<steps;n++)
				this[m][n]= m==n ? 1 : 0;
		}
	}
	var proto=CHImatrix.prototype;
	//设置矩阵的全体值
	proto.set=function(){
		var arg=arguments,s=this.steps;
		//使用另一个矩阵设置值
		if(isMatrix(arg[0]))
			for(var m=0;m<s;m++)
				for(var n=0;n<s;n++)
					this[m][n]=arg[0][m][n];
		else if(arg.length!=pow(s,2))return false;
		else //使用一列数字设置值
		for(var m=0;m<s;m++)
			for(var n=0;n<s;n++)
			{
				var a=arg[m*s+n];
				if(isNaN(a)) return false;
				this[m][n]=a;
			}
		return this;
	}
	//矩阵的转置
	proto.transpose=function(){
		for(var m=0;m<this.steps;m++)
			for(var n=m+1;n<this.steps;n++)
			{
				this[m][n]+=this[n][m];
				this[n][m]=this[m][n]-this[n][m];
				this[m][n]-=this[n][m];
			}
		return this;
	}
	//矩阵的加法
	proto.add=function(M){
		if(!isMatrix(M) || M.steps!=this.steps)return false;
		for(var m=0;m<this.steps;m++)
			for(var n=0;n<this.steps;n++)
				this[m][n]+=M[m][n];
		return this;
	}
	//矩阵的数乘
	proto.times=function(c){
		if(isNaN(c))return false;
		for(var m=0;m<this.steps;m++)
			for(var n=0;n<this.steps;n++)
				this[m][n]*=c;
		return this;
	}
	//获取矩阵的某一行/列向量
	proto.getRow=function(row){
		if(isNaN(row) || row>=this.steps)return false;
		var vec=[];
		for(var n=0;n<this.steps;n++)
			vec.push(this[row][n]);
		return vec;
	}
	proto.getColumn=function(col){
		if(isNaN(col) || col>=this.steps)return false;
		var vec=[];
		for(var m=0;m<this.steps;m++)
			vec.push(this[m][col]);
		return vec;
	}
	//本矩阵左乘参数矩阵，参数的行数等于本矩阵的列数
	proto.multiply=function(M){
		var s=this.steps;
		if(!isMatrix(M) || M.steps!=s)return false;
		var result=new CHImatrix(s),
			THIS=this;
		for(var m=0;m<s;m++)
			for(var n=0;n<s;n++)
				result[m][n]=(function(){
					var sum=0;
					for(var x=0;x<s;x++)
						sum+=THIS[m][x]*M[x][n];
					return sum;
				})();
		for(var m=0;m<s;m++)
			for(var n=0;n<s;n++)
				this[m][n]=result[m][n];
		result=null;
		return this;
	}
	CHImatrix.getMatrix={};
	var get=CHImatrix.getMatrix
	get.translate2D=function(x,y){
		if(isNaN(x) || isNaN(y))return false;
		var mat=new CHImatrix(3);
		return mat.set(
			1,0,0,
			0,1,0,
			x,y,1
		);
	}
	get.rotate=get.rotate2D=function(degree){
		if(isNaN(degree))return false;
		var mat=new CHImatrix(3),
			theta=a2t(degree),
			ct=cos(theta),
			st=sin(theta);
		return mat.set(
			ct,st,0,
			-st,ct,0,
			0,0,1
		);
	}
	get.scale2D=function(x,y){
		if(isNaN(x) || y && isNaN(y))return false;
		if(!y) y=x;
		var mat=new CHImatrix(3);
		return mat.set(
			x,0,0,
			0,y,0,
			0,0,1
		);
	}
	get.skewX=function(x){
		if(isNaN(x))return false;
		var mat=new CHImatrix(3);
		return mat.set(
			1,0,0,
			x,1,0,
			0,0,1
		);
	}
	get.skewY=function(y){
		if(isNaN(y))return false;
		var mat=new CHImatrix(3);
		return mat.set(
			1,y,0,
			0,1,0,
			0,0,1
		);
	}
	get.translate3D=function(x,y,z){
		if(isNaN(x) || isNaN(y) || isNaN(z))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			x,y,z,1
		);
	}
	get.scale3D=function(x,y,z){
		if(isNaN(x) || y && isNaN(y) || z && isNaN(z))return false;
		if(!y) y=x;
		if(!z) z=x;
		var mat=new CHImatrix(4);
		return mat.set(
			x,0,0,0,
			0,y,0,0,
			0,0,z,0,
			0,0,0,1
		);
	}
	get.rotateX=function(degree){
		if(isNaN(degree))return false;
		var mat=new CHImatrix(4),
			theta=a2t(degree),
			ct=cos(theta),
			st=sin(theta);
		return mat.set(
			1,0,0,0,
			0,ct,st,0,
			0,-st,ct,0,
			0,0,0,1
		);
	}
	get.rotateY=function(degree){
		if(isNaN(degree))return false;
		var mat=new CHImatrix(4),
			theta=a2t(degree),
			ct=cos(theta),
			st=sin(theta);
		return mat.set(
			ct,0,-st,0,
			0,1,0,0,
			st,0,ct,0,
			0,0,0,1
		);
	}
	get.rotateZ=function(degree){
		if(isNaN(degree))return false;
		var mat=new CHImatrix(4),
			theta=a2t(degree),
			ct=cos(theta),
			st=sin(theta);
		return mat.set(
			ct,st,0,0,
			-st,ct,0,0,
			0,0,1,0,
			0,0,0,1
		);
	}
	get.rotate3D=function(x,y,z,degree){
		if(isNaN(degree))return false;
		var mat=new CHImatrix(4),
			theta=a2t(degree),
			ct=cos(theta),
			st=sin(theta),
			mod=module(x,y,z),
			ct_=1-ct;
		x/=mod; y/=mod; z/=mod;
		return mat.set(
			x*x*ct_+ct,
			x*y*ct_+z*st,
			x*z*ct_-y*st,
			0,
			x*y*ct_-z*st,
			y*y*ct_+ct,
			y*z*ct_+x*st,
			0,
			x*z*ct_+y*st,
			y*z*ct_-x*st,
			z*z*ct_+ct,
			0,0,0,0,1
		);
	}
	get.skewXY=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,0,0,
			n,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
	}
	get.skewXZ=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,0,0,
			0,1,0,0,
			n,0,1,0,
			0,0,0,1
		);
	}
	get.skewYX=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,n,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
	}
	get.skewYZ=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,0,0,
			0,1,0,0,
			0,n,1,0,
			0,0,0,1
		);
	}
	get.skewZX=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,n,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
	}
	get.skewZY=function(n){
		if(isNaN(n))return false;
		var mat=new CHImatrix(4);
		return mat.set(
			1,0,0,0,
			0,1,n,0,
			0,0,1,0,
			0,0,0,1
		);
	}
	proto.translate2D=function(x,y){
		if(isNaN(x) || isNaN(y) || this.steps!=3)return false;
		return this.multiply(get.translate2D(x,y));
	}
	proto.translate3D=function(x,y,z){
		if(isNaN(x) || isNaN(y) || isNaN(z) || this.steps!=4)return false;
		return this.multiply(get.translate3D(x,y,z));
	}
	proto.translateX=function(x){
		if(!isNaN(x) || this.steps!=3 || this.steps!=4)return false;
		if(this.steps==3) return this.translate2D(x,0);
		return this.translate3D(x,0,0);
	}
	proto.translateY=function(y){
		if(!isNaN(y) || this.steps!=3 || this.steps!=4)return false;
		if(this.steps==3) return this.translate2D(0,y);
		return this.translate3D(0,y,0);
	}
	proto.translateZ=function(z){
		if(!isNaN(z) || this.steps!=4)return false;
		return this.translate3D(0,0,z);
	}
	proto.scale2D=function(x,y){
		if(isNaN(x) || y && isNaN(y) || this.steps!=3)return false;
		if(!y) y=x;
		return this.multiply(get.scale2D(x,y));
	}
	proto.scale3D=function(x,y,z){
		if(isNaN(x) || y && isNaN(y) || z && isNaN(z) || this.steps!=4)return false;
		if(!y) y=x;
		if(!z) z=x;
		return this.multiply(get.scale3D(x,y,z));
	}
	proto.scaleX=function(x){
		if(isNaN(x) || this.steps!=3 || this.steps!=4)return false;
		if(this.steps==3) return this.scale2D(x,1);
		return this.scale3D(x,1,1);
	}
	proto.scaleY=function(y){
		if(isNaN(y) || this.steps!=3 || this.steps!=4)return false;
		if(this.steps==3) return this.scale2D(1,y);
		return this.scale3D(1,y,1);
	}
	proto.scaleZ=function(z){
		if(isNaN(z) || this.steps!=4)return false;
		return this.scale3D(1,1,z);
	}
	proto.rotate=proto.rotate2D=function(degree){
		if(isNaN(degree) || this.steps!=3)return false;
		return this.multiply(get.rotate(degree));
	}
	proto.rotate3D=function(x,y,z,degree){
		if(isNaN(x) || isNaN(y) || isNaN(z) || isNaN(degree) || this.steps!=4)return false;
		return this.multiply(get.rotate3D(x,y,z,degree));
	}
	proto.rotateX=function(degree){
		if(isNaN(degree) || this.steps!=4)return false;
		return this.multiply(get.rotateX(degree));
	}
	proto.rotateY=function(degree){
		if(isNaN(degree) || this.steps!=4)return false;
		return this.multiply(get.rotateY(degree));
	}
	proto.rotateZ=function(degree){
		if(isNaN(degree) || this.steps!=4)return false;
		return this.multiply(get.rotateZ(degree));
	}
	proto.skewX=function(x){
		if(isNaN(x) || this.steps!=3)return false;
		return this.multiply(get.skewX(x));
	}
	proto.skewY=function(y){
		if(isNaN(y) || this.steps!=3)return false;
		return this.multiply(get.skewY(y));
	}
	proto.skewXY=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewXY(n));
	}
	proto.skewXZ=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewXZ(n));
	}
	proto.skewYX=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewYX(n));
	}
	proto.skewYZ=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewYZ(n));
	}
	proto.skewZX=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewZX(n));
	}
	proto.skewZY=function(n){
		if(isNaN(n) || this.steps!=4)return false;
		return this.multiply(get.skewZY(n));
	}
	//分割矩阵
	proto.split=function(){
		var result={};
		if(this.steps==3)
		{
			result.translateX=this[2][0];
			result.translateY=this[2][1];
			result.shear=this[2][2];
			result.scaleX=module(this[0][0],this[0][1]);
			result.scaleY=module(this[1][0],this[1][1]);
			var ct=this[0][0]/result.scaleX;
			result.rotate=t2a(acos(ct));
		}
		else if(this.steps==4)
		{
			var A=this[0][0],B=this[0][1],C=this[0][2],
				D=this[1][0],E=this[1][1],F=this[1][2],
				G=this[2][0],H=this[2][1],K=this[2][2];
			result.translateX=this[3][0];
			result.translateY=this[3][1];
			result.translateZ=this[3][2];
			result.shear=this[3][3];
			result.scaleX=module(A,B,C);
			result.scaleY=module(D,E,F);
			result.scaleZ=module(G,H,K);
			A/=result.scaleX; B/=result.scaleX; C/=result.scaleX;
			D/=result.scaleY; E/=result.scaleY; F/=result.scaleY;
			G/=result.scaleZ; H/=result.scaleZ; K/=result.scaleZ;
			function correct(n){
				return abs(n)*1e8<1 ? 0 :
					fix(n)*1==1 ? 1 :
						fix(n)*1==-1 ? -1 :
							n;
			}
			A=correct(A); B=correct(B); C=correct(C);
			D=correct(D); E=correct(E); F=correct(F);
			G=correct(G); H=correct(H); K=correct(K);
			//只有正交矩阵才能计算3D旋转值，而且矩阵的行列式值必须是1，不能是-1
			if(!(fix(A*D+B*E+C*F)-0) && !(fix(A*G+B*H+C*K)-0) && !(fix(D*G+E*H+F*K)-0)
			&& fix(A*E*K+B*F*G+C*D*H-A*F*H-B*D*K-C*E*G)==1)
			{
				var a2st=F-H,//2a*sinT
					b2st=G-C,//2b*sinT
					c2st=B-D,//2c*sinT
					ab2ct_=B+D,//2ab*(1-ct)
					ct=correct((A+E+K-1)/2),
					t1=acos(ct),
					d1=t2a(t1),
					st1=correct(sin(t1)),
					is180=st1==0,//如果bool=true，则angle不是180度
					a1=!is180 ? a2st/2/st1 : sqrt((A-ct)/(1-ct)),
					b1=!is180 ? b2st/2/st1 : sqrt((E-ct)/(1-ct)),
					c1=!is180 ? c2st/2/st1 : sqrt((K-ct)/(1-ct));
//				console.log(A,B,C,D,E,F,G,H,K);
//				console.log('--->',A,ct,A-ct,1-ct,a1);
//				console.log('--->',E,ct,E-ct,1-ct,b1);
//				console.log('--->',K,ct,K-ct,1-ct,c1);
				if(is180)
				{//180度的时候需要较正符号，随便哪个方向都一样
					if(fix(B)!=fix(a1*b1*(1-ct))) b1*=-1;
					if(fix(C)!=fix(a1*c1*(1-ct))) c1*=-1;
					if(fix(F)!=fix(b1*c1*(1-ct))) c1*=-1;
					result.rotate=[a1,b1,c1,d1];
				}
				else
				{
					var t2=2*PI-t1,
						d2=t2a(t2),
						st2=sin(t2),
						a2=a2st/2/st2,
						b2=b2st/2/st2,
						c2=c2st/2/st2;
					//两个旋转方式其实最终效果一致，只是旋转方向相反
					result.rotate=[
						[a1,b1,c1,d1],
						[a2,b2,c2,d2]
					];
				}
			}
		}
		return result;
	}
	//返回行列式的值
	proto.value=function(){
		var sum=0,
			index,
			pos,neg,
			steps=this.steps;
		for(var m=0;m<steps;m++)
		{
			index=m;
			pos=neg=1;
			for(var n=0;n<steps;n++)
			{
				index=(m+n)%steps;
				pos*=this[n][index];
				index=(m-n+steps)%steps;
				neg*=this[n][index];
			}
			sum+=pos-neg;
		}
		return sum;
	}
	
	window.isMatrix=function(o){return o instanceof CHImatrix;}
	window.CHImatrix=function(step){
		return new CHImatrix(step);
	}
	window.CHImatrix.getMatrix=get;
})();
