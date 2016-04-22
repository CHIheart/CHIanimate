// 用于制作魔方的单位立方体对象
var GlobalCubeUnit=100;
var GlobalOpacity=0.8;
function CHIcube(paper,options)
{
	if(!paper)return undefined;
	if(!options)options={};
	var L=GlobalCubeUnit/2,o={};
	var ps=[
		CHIpoint3D(L,L,L)		//I
		,CHIpoint3D(-L,L,L)		//II
		,CHIpoint3D(-L,-L,L)	//III
		,CHIpoint3D(L,-L,L)		//IV
		,CHIpoint3D(L,L,-L)		//V
		,CHIpoint3D(-L,L,-L)	//VI
		,CHIpoint3D(-L,-L,-L)	//VII
		,CHIpoint3D(L,-L,-L)	//VIII
	];
	//可以全体控制的集合，使用options以节省不需要判断颜色的面
	paper.setStart();
	if(options.back) o.back=paper.polygon3D(ps[1],ps[2],ps[6],ps[5]).attr({fill:'orange'})//.data('cube',o);
	else o.back=0;
	if(options.bottom) o.bottom=paper.polygon3D(ps[4],ps[5],ps[6],ps[7]).attr({fill:'green'})//.data('cube',o);
	else o.bottom=0;
	if(options.left) o.left=paper.polygon3D(ps[2],ps[3],ps[7],ps[6]).attr({fill:'white'})//.data('cube',o);
	else o.left=0;
	if(options.right) o.right=paper.polygon3D(ps[0],ps[1],ps[5],ps[4]).attr({fill:'yellow'})//.data('cube',o);
	else o.right=0;
	if(options.front) o.front=paper.polygon3D(ps[0],ps[3],ps[7],ps[4]).attr({fill:'red'})//.data('cube',o);
	else o.front=0;
	if(options.top) o.top=paper.polygon3D(ps[0],ps[1],ps[2],ps[3]).attr({fill:'blue'})//.data('cube',o);
	else o.top=0;
	var st=paper.setFinish();
	st.data('cube',o).attr('fill-opacity',GlobalOpacity);
	
	function setPosition()
	{
		if(o.back)o.back.data('position','back');
		if(o.bottom)o.bottom.data('position','bottom');
		if(o.left)o.left.data('position','left');
		if(o.right)o.right.data('position','right');
		if(o.front)o.front.data('position','front');
		if(o.top)o.top.data('position','top');
	}
	setPosition();
	
	o.x=options.x;
	o.y=options.y;
	o.z=options.z;
	//st.attr('title',o.x+','+o.y+','+o.z);
	o.all=function(){return st;}
	//着色，可以给任意面着色，如果使用一个颜色则默认填充，也可以使用attr方法可以使用的对象
	o.color=function(side,attr){
		side=side.toLowerCase();
		if(!('top,bottom,left,right,front,back,all'.split(',').has(side)))return undefined;
		var obj=isObj(attr) ? attr : {fill:attr};
		if(side!=='all') o[side].attr(obj)
		else st.attr(obj);
		return this;
	}
	o.translate3D=function(x,y,z){st.translate3D(x,y,z);return this;}
	var rotateLock=false;
	o.rotateX=function(times){
		var temp;
		times=TidyTimes(times);
		times%=4;
		if(!times) return this;
		switch(times)
		{
			case 1:
				temp=o.top;
				o.top=o.right;
				o.right=o.bottom;
				o.bottom=o.left;
				o.left=temp;
				break;
			case 2:
				temp=o.top;
				o.top=o.bottom;
				o.bottom=temp;
				temp=o.right;
				o.right=o.left;
				o.left=o.temp;
				break;
			case 3:
				temp=o.top;
				o.top=o.left;
				o.left=o.bottom;
				o.bottom=o.right;
				o.right=temp;
				break;
		}
		st.rotateX(times*90);
		setPosition();
		return this;
	}
	o.rotateY=function(times){
		var temp;
		times=TidyTimes(times);
		times%=4;
		if(!times) return this;
		switch(times)
		{
			case 1:
				temp=o.top;
				o.top=o.back;
				o.back=o.bottom;
				o.bottom=o.front;
				o.front=temp;
				break;
			case 2:
				temp=o.top;
				o.top=o.bottom;
				o.bottom=temp;
				temp=o.front;
				o.front=o.back;
				o.back=o.temp;
				break;
			case 3:
				temp=o.top;
				o.top=o.front;
				o.front=o.bottom;
				o.bottom=o.back;
				o.back=temp;
				break;
		}
		st.rotateY(times*90);
		setPosition();
		return this;
	}
	o.rotateZ=function(times){
		var temp;
		times=TidyTimes(times);
		times%=4;
		if(!times) return this;
		switch(times)
		{
			case 1:
				temp=o.front;
				o.front=o.left;
				o.left=o.back;
				o.back=o.right;
				o.right=temp;
				break;
			case 2:
				temp=o.left;
				o.left=o.right;
				o.right=temp;
				temp=o.front;
				o.front=o.back;
				o.back=o.temp;
				break;
			case 3:
				temp=o.front;
				o.front=o.right;
				o.right=o.back;
				o.back=o.left;
				o.left=temp;
				break;
		}
		st.rotateZ(times*90);
		setPosition();
		return this;
	}
	o.moveFront=function(point){
		st.forEach(function(ele){
			if(ele.hasPoint(point))
			{
				ele.toFront();
				console.log(ele.attr("title") + ' has point '+ point.data("point"));
			}
		});
		return this;
	}
	o.nofill=function(){st.attr({fill:false});return this;}
	o.hide=function(){st.hide();return this;}
	o.show=function(){st.show();return this;}
	//自动判断那些面是可见的
	return o;
}