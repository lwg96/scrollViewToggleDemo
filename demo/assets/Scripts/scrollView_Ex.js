/**
 * !#en Enum for ScrollView event type.
 * !#zh 滚动视图事件类型
 * @enum ScrollView.EventType
 */
var EventType = cc.Enum({
    /**
     * !#en The event emmitted when ScrollView scroll to the top boundary of inner container
     * !#zh 滚动视图滚动到顶部边界事件
     * @property {Number} SCROLL_TO_TOP
     */
    SCROLL_TO_TOP : 0,
    /**
     * !#en The event emmitted when ScrollView scroll to the bottom boundary of inner container
     * !#zh 滚动视图滚动到底部边界事件
     * @property {Number} SCROLL_TO_BOTTOM
     */
    SCROLL_TO_BOTTOM : 1,
    /**
     * !#en The event emmitted when ScrollView scroll to the left boundary of inner container
     * !#zh 滚动视图滚动到左边界事件
     * @property {Number} SCROLL_TO_LEFT
     */
    SCROLL_TO_LEFT : 2,
    /**
     * !#en The event emmitted when ScrollView scroll to the right boundary of inner container
     * !#zh 滚动视图滚动到右边界事件
     * @property {Number} SCROLL_TO_RIGHT
     */
    SCROLL_TO_RIGHT : 3,
    /**
     * !#en The event emmitted when ScrollView is scrolling
     * !#zh 滚动视图正在滚动时发出的事件
     * @property {Number} SCROLLING
     */
    SCROLLING : 4,
    /**
     * !#en The event emmitted when ScrollView scroll to the top boundary of inner container and start bounce
     * !#zh 滚动视图滚动到顶部边界并且开始回弹时发出的事件
     * @property {Number} BOUNCE_TOP
     */
    BOUNCE_TOP : 5,
    /**
     * !#en The event emmitted when ScrollView scroll to the bottom boundary of inner container and start bounce
     * !#zh 滚动视图滚动到底部边界并且开始回弹时发出的事件
     * @property {Number} BOUNCE_BOTTOM
     */
    BOUNCE_BOTTOM : 6,
    /**
     * !#en The event emmitted when ScrollView scroll to the left boundary of inner container and start bounce
     * !#zh 滚动视图滚动到左边界并且开始回弹时发出的事件
     * @property {Number} BOUNCE_LEFT
     */
    BOUNCE_LEFT : 7,
    /**
     * !#en The event emmitted when ScrollView scroll to the right boundary of inner container and start bounce
     * !#zh 滚动视图滚动到右边界并且开始回弹时发出的事件
     * @property {Number} BOUNCE_RIGHT
     */
    BOUNCE_RIGHT : 8,
    /**
     * !#en The event emmitted when ScrollView scroll ended
     * !#zh 滚动视图滚动滚动结束的时候发出的事件
     * @property {Number} AUTOSCROLL_ENDED
     */
    AUTOSCROLL_ENDED : 9,
    /**
     * !#en The event emmitted when user release the touch
     * !#zh 当用户松手的时候会发出一个事件
     * @property {Number} TOUCH_UP
     */
    TOUCH_UP : 10
});
var eventMap = {
    'scroll-to-top' : EventType.SCROLL_TO_TOP,
    'scroll-to-bottom': EventType.SCROLL_TO_BOTTOM,
    'scroll-to-left' : EventType.SCROLL_TO_LEFT,
    'scroll-to-right' : EventType.SCROLL_TO_RIGHT,
    'scrolling' : EventType.SCROLLING,
    'bounce-bottom' : EventType.BOUNCE_BOTTOM,
    'bounce-left' : EventType.BOUNCE_LEFT,
    'bounce-right' : EventType.BOUNCE_RIGHT,
    'bounce-top' : EventType.BOUNCE_TOP,
    'scroll-ended' : EventType.AUTOSCROLL_ENDED,
    'touch-up' : EventType.TOUCH_UP

};

cc.Class({
    extends: cc.ScrollView,

    properties: {

        toggleCheckDis:{
            default: 0,
            tooltip: CC_DEV && 'change toggle distance, default half of scrollview.content.y',
        },

        toggleGroup:{
            default: undefined,
            type: cc.ToggleGroup
        }
    },

    _onTouchBegan: function(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        if (this.content) {
            this._handlePressLogic(touch);
        }
        this._touchMoved = false;
        this._stopPropagationIfTargetIsMe(event);


        this.contentTouchBeganY = 0;
        this.contentTouchEndY = 0;
    },


    _onTouchMoved: function(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        cc.log("start:",JSON.stringify(touch.getDelta()));

        this.contentTouchEndY += touch.getDelta().y;

        if (this.content) {
            this._handleMoveLogic(touch);
        }
        // Do not prevent touch events in inner nodes
        if (!this.cancelInnerEvents) {
            return;
        }

        var deltaMove = cc.pSub(touch.getLocation(), touch.getStartLocation());
        //FIXME: touch move delta should be calculated by DPI.
        if (cc.pLength(deltaMove) > 7) {
            if (!this._touchMoved && event.target !== this.node) {
                // Simulate touch cancel for target node
                var cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                cancelEvent.touch = event.touch;
                cancelEvent.simulate = true;
                event.target.dispatchEvent(cancelEvent);
                this._touchMoved = true;
            }
        }
        this._stopPropagationIfTargetIsMe(event);
    },


    _onTouchEnded: function(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        var touch = event.touch;
        cc.log("end:",JSON.stringify(touch.getDelta()));
        if (this.content) {
            this._handleReleaseLogic(touch);
        }
        this._dispatchEvent('touch-up');
        if (this._touchMoved) {
            event.stopPropagation();
        } else {
            this._stopPropagationIfTargetIsMe(event);
        }

        this.checkToggle("end");

        
    },

    _onTouchCancelled: function(event, captureListeners) {
        if (!this.enabledInHierarchy) return;
        if (this._hasNestedViewGroup(event, captureListeners)) return;

        // Filte touch cancel event send from self
        if (!event.simulate) {
            var touch = event.touch;
            if(this.content){
                this._handleReleaseLogic(touch);
            }
        }
        this._stopPropagationIfTargetIsMe(event);

        this.checkToggle("cancle");
    },


    checkToggle:function(name){
        cc.log("checkToggle . " + name, this.contentTouchEndY);
        let dis = this.toggleCheckDis?this.toggleCheckDis:this.node.getContentSize().height/2;
        if (Math.abs(this.contentTouchEndY) >= dis){
            let currentIndex = this.getCurrentToggleIndex();
            this.setToggleIndex(this.contentTouchEndY > 0 ? currentIndex+1 : currentIndex-1);
        }
    },

    getCurrentToggleIndex:function(){
        let toggleItems = this.toggleGroup.node.children;
        for (let i = 0,len = toggleItems.length; i< len; i++){
            let toggle = toggleItems[i];
            if (toggle.getComponent(cc.Toggle).isChecked){
                return i ;
            }
        }
    },

    setToggleIndex:function(toggleIndex){//
        let toggleItems = this.toggleGroup.node.children;
        if (toggleItems[toggleIndex]){
            toggleItems[toggleIndex].getComponent(cc.Toggle).check();
        }
    },

    //顺序
    //_updateCheckMark更改toggle展示
    //_emitToggleEvents发送事件
    //更改toggleGroup底下toggle的isChecked属性
    checkEvent:function(target,index){
        cc.log("checkEvent:",this.getCurrentToggleIndex(),index);
        this.setScrollViewData(index);
    },

    setScrollViewData:function(index){
        let child = this.content.children;
        for (let i =0,len = child.length; i<len; i++){
            child[i].getComponent(cc.Label).string = "this is toggle " + index +" =======================================\nthis is toggle\nthis is toggle\nthis is toggle\nthis is toggle" ;
        }

        this.scrollToLeft(0.1);
    }

    

});
