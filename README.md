# scrollViewToggleDemo
## 版本号: CCC 1.4.2
  功能:scrollView水平可滑动，垂直方向锁定不可滑动但会计算触摸开始到触摸结束的差值，超过某个定值将进行toggle的切换，并刷新content的内容。
  实现方式: 继承cc.ScrollView,计算每次移动时touch.getDelta().y的增量,判断是否改变toggle组件check属性。  

