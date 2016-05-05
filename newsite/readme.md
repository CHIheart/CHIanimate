# 文件部署方案 2016-04-19

+ 整站使用覆盖式发布，全站强制浏览器缓存资源文件，适合中小型网站。
+ 使用PHP+Apache+Mysql，需要安装**Node.js**及**npm**安装**uglifyjs**
+ 页面编写区分需要SEO及非SEO文件，由于angular生成的页面对优化不友好
+ 全局调用jQuery/seajs/angular，某些位置会使用raphael

## 目录部署

### 基本原则

+ 整站使用模块分割方法编写，每个模块自己一个目录，通用模块放在**incs**目录下
+ 每个大页面都使用自己的根级目录，且内部分块都放在自己的这个目录里边，参考index
+ 通用资源文件，放在**srcs**目录中，包含**css**,**js**,**fonts**,**images**,**medias**

### /srcs/css 目录
+ **css**，通用样式表目录，只存在一个被引用的文件，即`css.css`，引用在`/incs/always.html`中
+ **css/theme**，风格配色目录，其内的Less文件，每次只能有一个被**css/_theme.less**引用
+ **css/_funs.less**，Less命令库，自己封装的简写命令
+ **css/_form.less**，通用表单样式，配合Angular给表单附加的验证类（比如ng-valid等）
+ **css/_icons.less**，图标字体样式文件，使用的是IconMoon生成的style.css文件
+ **css/_style.less**，恒预定义样式，基本上每种风格配色下都是这种样子的样式表

### /srcs/js 目录
+ **js**，通用脚本，是全站都可能会用到的通用脚本，是限制基于四大库编写的脚本，或无任何依赖的脚本
+ **js/datas**，通用数据文件目录，基本上是JSON数据，不依赖任何脚本，引用时优先于其它脚本，但低于库
+ **js/effects**，通用特效库目录，基本上基于jQuery及Raphael编写，引用时通常是使用require的
+ **js/plugins**，通用插件库目录，是无界面的插件，比如扩展库或用于操作界面的初始化脚本，引用时通常是使用require的
+ **jq_sea_angular.js**，三大库的合并包，文件名标识版本，引用在`/incs/always.html`中
+ **raphael.js**，Raphael库，单独放置，因为不一定每页都会使用到矢量绘图

### srcs下其它目录
+ **/srcs/fonts/**，使用IconMoon生成的图标字体目录，生成后下载，直接将zip包中的fonts目录拽进来
+ **/srcs/images/**，全站通用图片目录，比如LOGO/FavIcon等
+ **/srcs/medias/**，全站通用的媒体目录，放置视频/动画/音乐等

### incs目录
+ 全站通用碎片目录，所有的通用模块都放置在这里边，无论是结构性的还是功能性的
+ **header**,**footer**等目录，为结构性目录，指全站通用的页眉页脚侧边栏等，不同的通用部分按位置区分目录，比如前台页面与需要登录的页面的头长得不一样就分开两个目录放
+ **login**,**winlit**等目录，为功能性目录，指全站通用的小插件，比如局部登录/模态框等，它们按需调用，通过ajax/loadPlugin.php来返回内容，返回的内容是集合了自身的Css/Html/Js，以降低响应时间
+ **always.html**，通用头文件，全站使用UTF-8码，无法由用户缩放屏幕，全站防低端显示的条件性注释，引用通用的css及js库等

## 编写规则

### 统一原则

+ 所有页面都分块，尽可能在小碎片与少文件之间取得平衡，每块放一个目录
+ 文件命名只使用驼峰法，不可以有特殊符号，而且只能有一个**`.`**，即扩展名
+ 每一块都拥有自己的`Less`/`Js`/`Html`文件，都放在同一个文件夹里，三种主文件都与目录名同名
+ 资源文件，如果是独自使用的则放在碎片目录里，如果是共用的放在**srcs/images**目录里
+ 如果有子文件的话，如非必要则也放在此文件夹里边，不另行分块

### HTML文件规则

+ 所有Html中的资源文件都以相对于当前文件的写法写，或以站点根目录，或广域网地址
+ Html文件如果引用Css的话，一定写在第一行
+ Html文件如果引用Js的话，一定写在最后一行
+ Html文件中不含有内联式的style样式表或script脚本
+ Html中引用的资源，如果是以'/'开头的话，则是相对于站点静态资源目录（WEBROOT_AT_HOST常量）的，而不是基于站点根目录的

### CSS文件规则

+ 编译的Less文件，直接自动保存为压缩好了的Css文件
+ 在Html碎片文件中引用的Css文件，基本上都为自身目录中的同名文件
+ 如果某个碎片含有子文件时，如无必要，要子文件要用到的样式也写在主文件的样式表中
+ 无论是否为开发环境，CSS始终会被打包（压缩则免，因为从Less编译时已经压缩）

### JS文件规则

+ 使用SEAJS/Angular/JQuery，且此三者为全局引入型
+ 编写的JS文件不压缩，以便调试，在发布后会打包压缩
+ 每个模块的Js文件，都使用实名无明显依赖写法，且在文件尾使用seajs.use自动调用
+ 当模块需要依赖外部Js时，都使用顶级模块名，被引入的模块基本上都为匿名模块
+ 发布时会将Js打包压缩，所有的require中的模块名都会被替换成http开头的

## 打包（只与css和js有关）

+ 所有的本站css和js都会被判断是否需要打包及如何打包，而忽略外引（使用//或http(s)开头的）资源
+ 通用碎片的同类资源文件会被打包在一起，定格在主文件的旁边，以主文件名为开头，下划线连接其它碎片资源
+ 在访问根文件时，会先生成打包文件，然后显示打包文件解析后的内容
+ 打包后的文件，里边无论什么资源都是以广域网定义的URI，且附加MD5戳，以实现强制浏览器缓存及覆盖式发布

### HTML模块引用语法

+ 所有模块使用&lt;-- include --&gt;来引用子文件
+ **src**，必需的属性，写在第1位，一般使用相对路径，或资源目录根路径
+ **condition**，可选属性，写在第2位，一般是简单地判断式语法，使用PHP，当`condition`为`true`时才会继续向下进行，或直接显示子文件
+ **variable**，可选属性，如果不写则为当前层级的`$aData`数组，如果要引用当前数据的一个键需要写成`$aData[键名]`
+ **repeats**，可选属性，如果不写则直接使用`$aData`数组，显示被引入的子文件1次，如果写了则`variable`所代表的数据必须为自然数组，值`-1`为不限制循环次数

### 小插件的调用

+ 在各JS中，在需要的位置才调用模块，这样就可以达到按需调用的目的，节省资源及响应
+ 各插件符合目录部署规则（同名规则），引用到页面上的是被打包后的插件文件，所有它的JS及CSS都已经在返回的内容中了
+ 小插件的JS也是，在开发环境时不压缩，使用环境时压缩

## 环境

+ 环境分为开发环境及使用环境，开发环境不压缩JS，使用环境压缩JS
+ 会生成cache目录，但目录里边的文件结构会略有变化，根据文件相互引用的方式而决定位置
+ 因为打包优先于显示，显示的内容都是打包过后再用数据解析的文件，而非拼接的碎片模块

### 开发环境

+ Html分块，主文件四大文件与所在目录同名，比如（index目录下放index.html/.js/.less/.css）
+ 每次都会重新写当前所浏览的页面所用到的资源，以看到变化及方便调试

### 使用环境

+ 除了JS会压缩之外，基本上与开发环境无异，只是当要生成的**文件已经存在**时，使用环境下不重新生成这个文件
+ 使用环境下，每次都是先从cache目录里边读文件，如果不存在，才会像开发环境一样，先打包一个cache文件，再输出

## 其它

+ 手动批量打包功能，正在准备中......