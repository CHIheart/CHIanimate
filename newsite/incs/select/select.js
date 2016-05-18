/**
 * 下拉菜单初始化，基本交互行为
 * @authors Your Name (you@example.org)
 * @date    2016-05-16 14:27:10
 * @version $Id$
 */

define(function(require,exports,module){
	$(".SELECT")
		.find('dt').click(function(event) {
			var SELECT=$(this).closest('.SELECT').toggleClass('on');
			$(".SELECT").not(SELECT).removeClass('on');
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
					var input=$(this).siblings("input[type='text']");
					if(input.val()!=tar.data("id")) input.val(tar.data("id")).change();
					$(this).siblings('dt').text($(tar).text());
				}
			}
			//关闭列表
			$(this).closest('.SELECT').removeClass('on');
		})
		//把带有data-id属性的a的href移除
		.each(function(index, el) {
			$(this).find('[data-id]').removeAttr('href');
		})
		//初始化取值框里边的值
		.siblings('input[type="text"]').each(function(index, el) {
			var value=$(this).val();
			$(this).siblings('dd').find("[data-id='"+ value +"']").click();
		});
	//点击时关闭非本位所处的下拉菜单之外的其它菜单
	$("body").click(function(event) {
		var select=$(event.target).closest('.SELECT');
		$(".SELECT").not(select).removeClass('on');
	});
	return ;
});