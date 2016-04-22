// 旋律密码
function CHIrhythm(text,keys)
{
	var ts=text.split('\n'),
		rs='',
		r=c=0
	;
	var ks=keys.split('');
	for(var n=0;n<ts.length;n++)
	{
		ts[n]=ts[n].split('');
	}
	function low(s){return /^[a-g]$/.test(s);}
	function mid(s){return /^[1-7]$/.test(s);}
	function up(s){return /^[A-G]$/.test(s);}
	function sign(s){return /^[\^\#\~\.]$/.test(s);}
	function row(n)
	{
		r+=n+ts.length;
		r%=ts.length;
	}
	function col(n)
	{
		console.log('move column from '+c+' by '+n);
		c+=n;
		while(c<0)
		{
			row(-1);
			c+=ts[r].length;
		}
		while(c>=ts[r].length)
		{
			c-=ts[r].length;
			row(1);
		}
		console.log('point to '+ts[r][c]);
	}
	
	var la/*last action*/,d/*delta*/,o/*offset*/,pa/*prepare action*/;
	var s={/*signal*/
		a:0
		,b:0
		,c:0
		,d:0
		,e:0
		,f:0
		,g:0
	};
	
	function pre(char)
	{
		if(pa) switch(pa)
		{
			case "sharp": s[char]++; break;
			case "flat": s[char]=Math.max(0,s[char]-1); break;
			case "reset": s[char]=0; break;
		}
		pa='';
	}
	function A(b)/*abondon*/
	{
		pre('a');
		col(( b ? d : (s.a+1) ));
	}
	function B(b)/*backward*/
	{
		pre('b');
		col(( b ? d : (s.b+1) )*-1);
	}
	function C(b)/*copy*/
	{
		pre('c');
		col(( b ? (d-1) : s.c ));
		rs+=ts[r][c];
		col(1);
	}
	function D(b)/*damage*/
	{
		pre('d');
		col(( b ? (d-1) : s.d ));
		ts[r].splice(c,1);
	}
	function E(b)/*erase*/
	{
		pre('e');
		col(( b ? d : (s.e+1) )*-1);
		ts[r].splice(c,1);
	}
	function F(b)/*fetch*/
	{
		pre('f');
		col(( b ? d : (s.f+1) )*-1);
		rs+=ts[r][c];
		ts[r].splice(c,1);
	}
	function G(b)/*get*/
	{
		pre('g');
		col(( b ? (d-1) : (s.g+1) ));
		rs+=ts[r][c];
		ts[r].splice(c,1);
	}
	function Z(){r=c=0;}
	
	while(ks.length)
	{
		var k=ks.shift();
		var rl=ts.length;
		var cl=ts[r].length;
		
		if(sign(k))
		{
			if(k!='.'){la='';d=0;}
			switch(k)
			{
				case "#":
					pa='sharp';
					break;
				case "^":
					pa='flat';
					break;
				case "~":
					pa='reset';
					break;
				case ".":
					d=d?d*2:2;
					console.log('delta increase to '+ d);
					la(true);
					break;
			}
		}
		else
		{
			d=o=0;
			if(low(k)) row(-1);
			else if(up(k)) row(1);
			switch(k)
			{
				case "a":
				case "A":
				case "6":
					A();
					la=A;
					break;
				case "b":
				case "B":
				case "7":
					B();
					la=B;
					break;
				case "c":
				case "C":
				case "1":
					C();
					la=C;
					break;
				case "d":
				case "D":
				case "2":
					D();
					la=D;
					break;
				case "e":
				case "E":
				case "3":
					E();
					la=E;
					break;
				case "f":
				case "F":
				case "4":
					F();
					la=F;
					break;
				case "g":
				case "G":
				case "5":
					G();
					la=G;
					break;
				case "0":
					Z();
					break;
			}
		}
	}
	return [ts,rs];
}
