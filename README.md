# CHIanimate 的开发意图
　　有许多前端程序员习惯使用JQuery跟Raphael进行动画效果的编写，但是动画没有办法简单地按照作者的意图进行串联，如果每次都用回调写的话，代码就会变得很丑很难维护，所以CHIanimate的用途就在于此，可以让程序员将动画的每个动作逐一编写，然后按照树型的结构将它们串在一起，过程中可以随时更改动画树的结构，让动画按照特定的顺序播放。

## 脚本的依赖性
* 起码要包含jQuery或Raphael
* 可以使用jQuery，可以直接使用jQuery的animate效果编写动画，并将动画串起来。
* 可以使用Raphael，用法与jQuery差不多，有些细节的地方不大一样（比如说集合的遍历跟回调的写法)  

## 对系统或包含库的改动
* 在低端浏览器中，增加了Array.prototype.indexOf方法
* 如果包含了Raphael，则会扩展Element.indexOf、Element.forEach、Set.indexOf
* 直接在window对象上增加CHIanimate方法，无需使用new运算符

# 基本的使用方法
## 创建一个动画对象
```javascript
var a=CHIanimate(actor, oAttrs_sAction, oOptions);
```
### 基本参数说明
1. `actor`：可以是一个JQ对象/选择器，也可以是一个Raphael的Element或Set对象  
2. `oAttrs_sAction`：可以是一个JQ/Raphael的动画命令（如`fadeIn`,`slideUp`或其它自扩展指令等)，也可以是一个{attr:value}对象  

> 如果是JQ动画的话，这个键值对对象，可以是attr:[value,easing]的形式，以对不同属性使用不同的缓冲效果  
> 如果是Raphael动画的话，如果想用每个属性不同缓冲的话，请分成多个动画实例，然后连接在动画链的同一位置  

3. `oOptions`：也是一个{attr:value}对象，可以包含的属性有：  
* `duration`：对于JQ来说可以省略，但Raphael的话就必须写，该动画动作耗时，**数字型**，毫秒数
* `easing`：缓冲函数，可以使用JQ扩展的缓冲函数，Raphael的缓冲函数与JQ不大一样，具体请查找各自的文档
* `done`：该动画的整体回调函数，也就本动画所有动作完成之后执行的函数，此函数的this是actor对应的对象，唯一的参数是本动画的内置计数器

>内置计数器就是计数动画对应的对象元素的总长度，但它是从0开始增长的，当增长到最大时就表示本动画的**本次**动作已经完全结束  

* `step`：动画步进回调函数，对应的是JQ动画中的step配置属性，或Raphael的onAnimation，此函数的this是actor对应的对象中的每个单元（因为actor有可能是一个集合)
* `each`：单元动画完成回调函数，（当actor是集合时）集合中的每个元素的动作完成时的回调函数，此函数的this是对应的每个单元对象，唯一的参数是单元对象在集合中的索引号
* `delay`：整体动画延迟，**数字型**，毫秒数
* `delta`：单元动画的延迟，**数字型**，毫秒数

> 如果是正数，就是顺序延迟，即从第1个元素往后，延迟越来越大，为`index*delta`毫秒  
> 如果是负数，就是倒序延迟，即从第n个元素往前，延迟越来越大，为`(length-index)*delta`毫秒

### 修改已有配置
生成的CHIanimate对象，可以修改在构造时的配置，此处修改的是基础配置，在修改后的执行都生效，可以调用的方法如下：  
* `.set(oNewOptions, bReset)`：修改某些参数，`oNewOptions`使用的就是{attr:value}的形式，`bReset`默认为`false`，如果为`true`的话会先清空原有配置，写入新配置
* `.duration(n)`：设置本动作的消耗，此处只限制使用正整数值
* `.delay(n)`：设置本动作的总延迟，此处只限制使用正整数值

### 复杂一些的配置方法
在`oAttrs_sAction`中使用的键值对，或`oOptions`中的`delta`、`delay`，都可以使用函数，对集合中的每个单元返回不同的值，而不必只使用简单的值  
* `oAttrs_sAction.*`：函数的this是对应的每个单元对象，唯一参数是单元对象在集合中的索引号
* `oOptions.delta`：同上，可以对每个元素生成不一样的延迟（比如在函数中返回随机数）
* `oOptions.delay`：函数的this是actor对象的元素，函数的唯一参数是actor对象的单元总数

## 将动作连接在一起
### 开放的动作连接方法
可以在CHIanimate对象的前后，链接另一个CHIanimate对象，或一个普通的function
* `.lead(o1,o2,...)`：在本对象的下向接入若干个CHIanimate对象或一个普通的function，重复的元素会被忽略
> 当本动作完全执行完毕后，会按顺序调用连接的下线动作  
* `.nolead(o1,o2,...)` ：将若干个下向接入的对象从本对象的下线删除，不存在的会被忽略
* `.follow(o1,o2,...)`：在本对象的上向接入若干个CHIanimate对象或一个普通的function，重复的元素会被忽略
> 当本动作的上线所有动作完成之后，才会执行本动作  
* `.nofollow(o1,o2,...)`：将若干个上向接入的对象从本对象的上线删除，不存在的会被忽略
* `.next(bool_force)`：手动触发下线动作，bool_force是**布尔型**，默认为`false`，即非强制执行，如果为`true`的话则不管本动作是否完成，强制执行下线动作
> 这些连接动作都是直接返回CHIanimate对象本身的，所以大家可以像JQ一样使用链式写法

## 执行动作
```javascript
a(oNewOptions, bMerge);
```
CHIanimate对象返回的是一个带有额外属性的function对象，所以可以直接使用括号()来执行动作。  
* `oNewOptions`：可以在临时执行时，修改当次的配置（即构造对象时的`oOptions`参数），以达到动态改变效果的目的  
* `bMerge`：默认为`false`，使`oNewOptions`只作用在这执行的一次，如果为`true`则会将本次配置并入构造对象时的`oOptions`中，修改原配置  

## 计数器事件
当动作为循环动作时（自己调用自己），内部会有一个计数器，记录（完整的）动作总共执行了多少次，我们可以给这些次数上增加一些事件。  

> 在以下的各个方法当中，参数`oCHI`都可以是CHIanimate对象或function对象，参数`bOut`都默认为`false`  

* `.at(n, oCHI, bOut)`：当第n次重复动作完成之时，执行一个事件；如果用来删除的话，则只会删除在n次上的这个动作
* `.before(n, oCHI, bOut)`：在第1~n次重复动作中，每次动作完成时，都执行一个事件；删除说明同上
* `.after(n, oCHI, bOut)`：在第n次重复动作完成之时，及后续每次动作完成时，都执行一个事件；删除说明同上
* `.each(n, oCHI, bOut)`：在每n次重复动作完成之时，都执行一个事件；删除说明同上
* `.when(a, b, oCHI, bOut)`：在符合次数为`ax+b`表达式时，执行一个事件；删除说明同上

> `when`方法是其它4个事件方法的基础，它们都是在调用`when`方法  
> `when`中的参数，`a`及`b`遵循CSS3的`nth-child`的表达式写法，即n=ax+b，其中x=1,2,3...，a及b为任意整数，但不能同时为非负整数  

* `.remove(oCHI)`：删除事件列表中所有的对应事件，无论表达式是什么

### 其它方法
* `.clone(bDeep)`：克隆本动作，默认`bDeep=false`，只复制构造函数上的三个参数（如果修改过配置的话，新对象的配置是当前生效的配置）；如果为`true`则会复制所有内容，包括动作的上下线及事件
其中`bDeep`参数也可以是一个{attr:Boolean}对象，可以使用的属性有	 
* `events`：是否复制事件  
* `nexts`：是否复制下线动作
* `follows`：是否复制上线动作

### 更多使用的实例，请参考WIKI页面 
