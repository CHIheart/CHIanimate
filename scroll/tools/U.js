//预置的转化函数，只能转化普通的数值及颜色
define(function(require,exports,module){
	var N=require("./N"),
		C=require("./C");
	return function(selector,original,terminal,returnValue){
		var attr=this.name;
		if(!(attr in original) || !(attr in terminal)) return false;
		var val1=original[attr],
			val2=terminal[attr];
		if(val2===null)
		{//终值如果是null则直接取初值
			terminal[attr]=original[attr];
			return true;
		}
		if(val1==val2) return true;
		var type=$.scrollbar[attr].type.toString().toLowerCase(),
			error;
		switch(type)
		{
			case 'value':
				var type1=N.type(val1),
					type2=N.type(val2);
				type1==='' && (original[attr]+='px',type1='px');
				type2==='' && (terminal[attr]+='px',type2='px');
				if(type1==type2) return true;
				var funName=type1+'2'+type2;
				if(funName in N)
				{
					original[attr]=N[funName](val1,selector);
					return true;
				}
				error="预置的单位转化函数无法处理这两个数值："+val1+','+val2;
				break;
			case 'color':
				var obj1=C.toObject(val1),
					obj2=C.toObject(val2),
					type1=C.type(obj1),
					type2=C.type(obj2);
				if(!type1 || !type2)
				{
					error="发现了不可识别的颜色：";
					!type1 && (error+='\n'+type1);
					!type2 && (error+='\n'+type2);
				}
				else
				{
					if(type1!=type2) obj1=C[type1+"2"+type2](obj1);
					original[attr]=C.toString(obj1);
					terminal[attr]=C.toString(obj2,obj1);
					return true;
				}
				break;
			case 'style':
				val1!=val2 && (/none/i.test(val1) && (original[attr]=val2))
					|| (/none/i.test(val2) && (terminal[attr]=val1));
				return true;
			case 'matrix': return true;
			default: error="目前只支持数值/颜色/样式/矩阵作为值！";
		}
		if(returnValue) return false;
		console.error(attr,error);
	};
});