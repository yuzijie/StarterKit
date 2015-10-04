# 总说明

* 基础
    * xhr.js：帮助简化 AJAX post/get 方法
    * helper.js：一些辅助性的小方法
    * prevent-scroll.js：页面某一些元素滚动时，阻止背景滚动
    * scrollbar.js：当 Body 设置为 `overflow: hidden` 时候，为解决滚动条消失问题，添加 right padding
    * geo.js：操作 HTML5 geolocation API
    * validator.js：验证表单
    * scroll-to.js：滚动页面到某元素的位置
    * anim.js：和 animation、transition 有关的方法
    * mvp-methods.js：MVP 用到的方法
    * mvp-model.js：MVP 的 Model 类和 Event 类
    * mvp-view.js：MVP 的 View 类
    * polyfill.js：是 Javascript 兼容不同浏览器
* 核心
    * box.js：定义页面中所有可以打开和关闭的元素的行为
    * dom.js：管理页面中动态添加的元素
    * slider.js：提供 slide show 的解决方案
    * verify.js：提供表单验证以及一些表单辅助的工具
* 组合
    * overlay.js：为页面添加 overlay
    * tooltip.js：弹出一个 Tooltip

* 待完成
    * loader.js：按照需要异步加载图片
    * filter.js：根据关键词隐藏不相关的内容
    * slide-box.js：定义页面中所有嵌入页面并可以切换内容或自伸缩的元素的行为
    * fake-select.js：把 HTML select 替换成 checkbox，同时提供 select 的所有功能
    * image-crop.js：提供切割图片的功能
    * multi-select.js：多选输入框，当用户有输入后，弹出下拉菜单，用户选择后下拉菜单消失，用户可以继续输入文字
* 已停用
    * listener.js：在元素内添加或删除 Listener
    * window-scroll.js：可以手动停止页面滚动，但是用处不是很大
    * insert.js：按需要自动在页面内插入 HTML 元素
    * float-box.js：定义网页中浮动的窗口
    * alert.js：弹出一个 Modal 提示框
    * form.js：定义页面中 Form 的行为，简化 Form 编程
    * form-with-validation.js：有验证提示的表单
    * event.js：MVP 里面的 Event
    * model.js：MVP 里面的 Model
    * view-class.js：用于生成 MVP 里面的 Presenter 类
