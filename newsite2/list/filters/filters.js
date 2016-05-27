/**
 * 过滤器
 * @authors Your Name (you@example.org)
 * @date    2016-05-24 09:18:34
 * @version $Id$
 */

define('filters',function(require,exports,module){
	$(".Filters .more").click(function(event) {
		$(this).siblings('.items').toggleClass('on');
	}).each(function(index, el) {
		var items=$(this).siblings('.items'),
			height=items.height(),
			maxh=items.find('div').height();
		if(height<maxh) $(this).show();
	});;
	return ;
});
seajs.use('filters');