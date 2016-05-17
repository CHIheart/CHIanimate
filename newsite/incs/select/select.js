/**
 * 下拉菜单初始化
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:27:10
 * @version $Id$
 */

define(function(require,exports,module){
	$(".SELECT")
		.find('dt').click(function(event) {
			$(this).closest('.SELECT').toggleClass('on');
		})
		.siblings('dd').click(function(event) {
			var tar=$(event.target);
			//触发行为的是没被选中的项
			if(!tar.hasClass('selected'))
			{
				//点亮当前项
				tar.addClass('selected').siblings().removeClass('selected');
				//如果是具有ID的下拉列表
				if(tar.data("id")!==undefined){
					//如果存值框中的值不相同的话，触发change行为
					var input=$(this).siblings("input[type='hidden']");
					if(input.val()!=tar.data("id")) input.val(tar.data("id")).change();
					$(this).siblings('dt').text($(tar).text());
				}
			}
			//关闭列表
			$(this).closest('.SELECT').removeClass('on');
			return ;
		})
		//把带有data-id属性的a的href移除
		.each(function(index, el) {
			$(this).find('[data-id]').removeAttr('href');
		})
		//初始化取值框里边的值
		.siblings('input[type="hidden"]').each(function(index, el) {
			var value=$(this).val();
			$(this).siblings('dd').find("[data-id='"+ value +"']").click();
		});
	return ;
});