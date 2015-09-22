# CHIanimate 的开发意图
有许多前端程序员习惯使用JQuery跟Raphael进行动画效果的编写，但是动画没有办法简单地按照作者的意图进行串联，如果每次都用回调写的话，代码就会变得很丑很难维护，所以CHIanimate的用途就在于此，可以让程序员将动画的每个动作逐一编写，然后按照树型的结构将它们串在一起，过程中可以随时更改动画树的结构，让动画按照特定的顺序播放。

## CHIanimate 的依赖
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


