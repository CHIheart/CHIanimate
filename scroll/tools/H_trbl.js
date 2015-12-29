//Firefox及IE下必须要组合复合属性，它们可以set但不可以get，所以要手动写，必须直接使用在某个属性上
define(function(require,exports,module){
	return function()
	{
		var attr=this.name,
			parts=this.parts;
		$.cssHooks[attr]={
			get: function(elem, computed, extra){
				var str=[];
				for(var n in parts)
					str.push($(elem).css(parts[n]));
				//四属性，返回合并属性
				if(str.length==4)
				{
					if(str[3]==str[1])
					{
						str.pop();
						if(str[2]==str[0])
						{
							str.pop();
							if(str[1]==str[0])
								str.pop();
						}
					}
				}
				return str.join(' ');
			}
		}
	};
});