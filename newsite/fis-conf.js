/*
less目录下的文件生成css文件
发送到上级目录的css目录中
*/
var VERSION="1.0.0";
fis//.media('less')
	.match('/less/(**).less',{
		release:'/css/$1'
	})
	.match('**.less', {
	    rExt: '.css', // from .less to .css
	    parser: fis.plugin('less-2.x', {
	        // fis-parser-less-2.x option
	    })
	});
/*
script目录下的文件，使用SEAJS编写
打包后放在js目录下
*/
fis//.media('script')
	.match("./script/(**).js",{
		postprocessor: function (content, file, settings) {
			var today=new Date(),
				jsons=[
					{
						from:'@authors Your Name \\(you@example\\.org\\)',
						to:'@authors Villerio (vrbvillor@126.com)'
					},{
						from:'@date( +)\\d{4}(\\-\\d{2}){2} \\d{2}(:\\d{2}){2}',
						to:'@date$1'+today.toLocaleDateString()+' '+today.toLocaleTimeString()
					},{
						from:'@version \\$Id\\$',
						to:'@version '+VERSION
					}
				],
				str=content;
			for(var n in jsons)
			{
				var reg=new RegExp(jsons[n].from,'gm')
				str=str.replace(reg,jsons[n].to);
			}
	        return str;
	    },
		release:false
	})
	.hook('cmd', {
		baseUrl: './script/'
	})
	.match('::packager', {
	    postpackager: fis.plugin('loader', {
			allInOne: {
				includeAsyncs: true,
				//ignore: ['/static/sea.js','pkg/**'],
				js: './js/${filepath}.js'
			}
	    })
	});


//忽略以下划线开头的文件
fis.match("_**",{
	isMod:true,
	release:false
})
.match("../**",{
	release:false
});


// 测试数据文件
fis.match('./data/**', {
    release: '$0'
});
// 发布时的优化
fis.media('prod')
    .match('**.js', {
        optimizer: fis.plugin('uglify-js', {
            mangle: {
                expect: ['require', 'define', 'exports', 'module'] //不想被压的
            }
        })
    })
    .match('**.css', {
        optimizer: fis.plugin('clean-css', {
            'keepBreaks': false //保持一个规则一个换行
        })
    });