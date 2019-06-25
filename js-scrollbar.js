(function (win, doc) {
    /**
     * 原生js滚动条插件
     * scrollSpeed      {number}  滚动速度
     * xScrollBarEnable {boolean} 横向滚动条是否可用
     * yScrollBarEnable {boolean} 垂直滚动条是否可用
     * wheelPropagation {boolean} 滚动事件是否冒泡
     * minScrollHeight  {number}  垂直滚动条最小高度
     * maxScrollHeight  {number}  垂直滚动条最大高度
     * minScrollWidth   {number}  横向滚动条最小高度
     * maxScrollWidth   {number}  横向滚动条最大高度
     * supportScroll    {boolean} 滚动条不消失
     * events           {array}   支持事件
     */
    let JSScrollBar = function (target, options) {
        let defaults = {
            scrollSpeed: 10,
            xScrollBarEnable: true,
            yScrollBarEnable: true,
            wheelPropagation: true,
            minScrollHeight: 50,
            maxScrollHeight: 600,
            minScrollWidth: 50,
            maxScrollWidth: 800,
            supportScroll: false,
            events: ["CLICK", "DRAG", "SCROLL"]
        };
        this.target = target;  //必须  需要创建滚动条的DOM元素
        this.options = {};
        // this.options = Object.assign({}, defaults, options);
        //ie 不支持Object.assign
        for (let attr in defaults) {
            this.options[attr] = options[attr] || defaults[attr];
        }
    }

    JSScrollBar.prototype = {
        /**
         * 初始化函数
         */
        init: function () {
            this.renderDOM();
            this.update();
        },
        /**
         * 渲染DOM
         */
        renderDOM: function () {
            //移动端时暂时使用默认滚动条
            //todo 移动端滚动事件touch
            if (this.getDeviceType() === "MOBILE") {
                this.target.style.overflow = "auto";
                return;
            }
            if (this.target.className.indexOf("my-scrollbar-content") > -1) {
                return;
            }
            this.target.style.overflow = "hidden";
            //滚动条容器
            let container = doc.createElement("div");
            container.className = "my-scrollbar-container";
            container.style.width = this.target.clientWidth + "px";
            container.style.height = this.target.clientHeight + "px";

            let parentDIV = this.target.parentNode;  //父节点
            let nextDIV = this.target.nextSibling;  //下一个兄弟节点
            //判断是否存在兄弟节点
            if (nextDIV) {
                parentDIV.insertBefore(container, nextDIV);
            }
            this.target.className += " my-scrollbar-content";
            container.appendChild(this.target);
            //将container挂载到this上
            this.container = container;
            //生成横向滚动条并绑定事件
            this.options.xScrollBarEnable && this.createXScrollBar();
            //生成垂直滚动条并绑定事件
            this.options.yScrollBarEnable && this.createYScrollBar();
        },

        /**
         * 创建垂直滚动条
         */
        createYScrollBar: function () {
            let scrollBarY = doc.createElement("div");
            scrollBarY.className = "my-scrollbar-y";
            let sliderY = doc.createElement("div");
            sliderY.className = "y-slider";
            scrollBarY.appendChild(sliderY);
            this.container.appendChild(scrollBarY);

            //将scrollBarY和sliderY挂载到this上
            this.scrollBarY = scrollBarY;
            this.sliderY = sliderY;

            //容器可视高度小于实际高度时，再绑定事件
            if (this.target.clientHeight < this.target.scrollHeight) {


                //绑定滚轮事件
                if (this.options.events.indexOf("SCROLL") > -1) {
                    this.bindYWheelEvent();
                }
                //绑定点击事件
                if (this.options.events.indexOf("CLICK") > -1 || this.options.events.indexOf("DRAG") > -1) {
                    this.bindYClickEvent();
                }
            }
        },

        /**
         * 垂直滚动条滚轮事件
         */
        bindYWheelEvent: function () {
            //判断浏览器
            let isIE = navigator.userAgent.match(/MSIE (\d)/i);
            isIE = isIE ? isIE[1] : undefined;
            let isFF = /FireFox/i.test(navigator.userAgent);
            let content = this.target,
                sliderY = this.sliderY,
                me = this;
            if (isIE < 9) //传统浏览器使用MouseWheel事件
            {
                content.attachEvent("onmousewheel", function (e) {
                    //计算鼠标滚轮滚动的距离
                    let v = e.wheelDelta / 120 * me.options.scrollSpeed;
                    content.scrollTop += v;
                    sliderY.style.marginTop = (content.clientHeight - sliderY.clientHeight) * (content.scrollTop / (content.scrollHeight - content.clientHeight)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || content.scrollTop > 0 && (content.scrollTop < content.scrollHeight - content.clientHeight)) {
                        e.cancelBubble = true;
                    }
                    //阻止浏览器默认事件
                    return false;
                });
            }
            else if (!isFF) //除火狐外的现代浏览器也使用MouseWheel事件
            {
                content.addEventListener("mousewheel", function (e) {
                    //计算鼠标滚轮滚动的距离
                    let v = -e.wheelDelta / 120 * me.options.scrollSpeed;
                    content.scrollTop += v;
                    sliderY.style.marginTop = (content.clientHeight - sliderY.clientHeight) * (content.scrollTop / (content.scrollHeight - content.clientHeight)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || content.scrollTop > 0 && (content.scrollTop < content.scrollHeight - content.clientHeight)) {
                        e.stopPropagation();
                    }
                    //阻止浏览器默认事件
                    e.preventDefault();
                }, false);
            }
            else //火狐使用DOMMouseScroll事件
            {
                content.addEventListener("DOMMouseScroll", function (e) {
                    //计算鼠标滚轮滚动的距离
                    content.scrollTop += e.detail / 3 * me.options.scrollSpeed;
                    sliderY.style.marginTop = (content.clientHeight - sliderY.clientHeight) * (content.scrollTop / (content.scrollHeight - content.clientHeight)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || content.scrollTop > 0 && (content.scrollTop < content.scrollHeight - content.clientHeight)) {
                        e.stopPropagation();
                    }
                    //阻止浏览器默认事件
                    e.preventDefault();
                }, false);
            }
        },

        /**
         * 垂直滚动条点击事件
         */
        bindYClickEvent: function () {
            let content = this.target,
                scrollBarY = this.scrollBarY,
                sliderY = this.sliderY,
                me = this;
            //点击和拖动事件  IE11、Chrome和Firefox测试OK
            scrollBarY.onmousedown = function (e) {
                //判断鼠标点击元素  slider则为拖动，slider-bg则为点击
                if (e.target.className === "my-scrollbar-y" && me.options.events.indexOf("CLICK") > -1) {
                    let yTop = 0;
                    if (e.offsetY < scrollBarY.offsetHeight - sliderY.offsetHeight) {
                        yTop = e.offsetY;
                    }
                    else if (e.offsetY < scrollBarY.offsetHeight) {
                        yTop = e.offsetY - sliderY.offsetHeight;
                    }
                    sliderY.style.marginTop = yTop + "px";
                    content.scrollTop = (content.scrollHeight - content.clientHeight) * (yTop / (content.clientHeight - sliderY.clientHeight));
                }
                else if (me.options.events.indexOf("DRAG") > -1) {
                    me.addClass(doc.querySelector("body"), "no-select");
                    let top = e.clientY - sliderY.offsetTop;
                    document.onmousemove = function (e) {
                        me.addClass(sliderY, "slider-active");
                        var yTop = e.clientY - top;
                        if (yTop <= 0) {
                            yTop = 0;
                        };
                        if (yTop >= scrollBarY.clientHeight - sliderY.clientHeight) {
                            yTop = scrollBarY.clientHeight - sliderY.clientHeight;
                        };
                        sliderY.style.marginTop = yTop + "px";
                        content.scrollTop = (content.scrollHeight - content.clientHeight) * (yTop / (content.clientHeight - sliderY.clientHeight));
                    }
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        me.removeClass(sliderY, "slider-active");
                        me.removeClass(doc.querySelector("body"), "no-select");
                    }
                }
            }
        },

        /**
         * 创建横向滚动条
         */
        createXScrollBar: function () {
            let scrollBarX = doc.createElement("div");
            scrollBarX.className = "my-scrollbar-x";
            let sliderX = doc.createElement("div");
            sliderX.className = "x-slider";
            scrollBarX.appendChild(sliderX);
            this.container.appendChild(scrollBarX);

            //将scrollBarY和sliderY挂载到this上
            this.scrollBarX = scrollBarX;
            this.sliderX = sliderX;

            //容器可视高度小于实际高度时，再绑定事件
            if (this.target.clientWidth < this.target.scrollWidth) {
                this.addClass(this.sliderX, "enable");
                if (this.options.supportScroll) {
                    this.addClass(this.sliderY, "support");
                }
                //绑定滚轮事件
                if (this.options.events.indexOf("SCROLL") > -1) {
                    this.bindXWheelEvent();
                }
                //绑定点击事件
                if (this.options.events.indexOf("CLICK") > -1 || this.options.events.indexOf("DRAG") > -1) {
                    this.bindXClickEvent();
                }
            }
        },

        /**
         * 横向滚动条滚轮事件
         */
        bindXWheelEvent: function () {
            //判断浏览器
            let isIE = navigator.userAgent.match(/MSIE (\d)/i);
            isIE = isIE ? isIE[1] : undefined;
            let isFF = /FireFox/i.test(navigator.userAgent);
            let content = this.target,
                sliderX = this.sliderX,
                me = this;
            if (isIE < 9) //传统浏览器使用MouseWheel事件
            {
                content.attachEvent("onmousewheel", function (e) {
                    //计算鼠标滚轮滚动的距离
                    let v = e.wheelDelta / 120 * me.options.scrollSpeed;
                    content.scrollLeft += v;
                    sliderX.style.marginLeft = (content.clientWidth - sliderX.clientWidth) * (content.scrollLeft / (content.scrollWidth - content.clientWidth)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || (content.scrollLeft > 0 && content.scrollLeft < content.scrollWidth - content.clientWidth)) {
                        e.cancelBubble = true;
                    }
                    //阻止浏览器默认事件
                    return false;
                });
            }
            else if (!isFF) //除火狐外的现代浏览器也使用MouseWheel事件
            {
                content.addEventListener("mousewheel", function (e) {
                    //计算鼠标滚轮滚动的距离
                    let v = -e.wheelDelta / 120 * me.options.scrollSpeed;
                    content.scrollLeft += v;
                    sliderX.style.marginLeft = (content.clientWidth - sliderX.clientWidth) * (content.scrollLeft / (content.scrollWidth - content.clientWidth)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || (content.scrollLeft > 0 && content.scrollLeft < content.scrollWidth - content.clientWidth)) {
                        e.stopPropagation();
                    }
                    //阻止浏览器默认事件
                    e.preventDefault();
                }, true);
            }
            else //火狐使用DOMMouseScroll事件
            {
                content.addEventListener("DOMMouseScroll", function (e) {
                    //计算鼠标滚轮滚动的距离
                    content.scrollLeft += e.detail / 3 * me.options.scrollSpeed;
                    sliderX.style.marginLeft = (content.clientWidth - sliderX.clientWidth) * (content.scrollLeft / (content.scrollWidth - content.clientWidth)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || (content.scrollLeft > 0 && content.scrollLeft < content.scrollWidth - content.clientWidth)) {
                        e.stopPropagation();
                    }
                    //阻止浏览器默认事件
                    e.preventDefault();
                }, false);
            }
        },

        /**
         * 横向滚动条点击事件
         */
        bindXClickEvent: function () {
            let content = this.target,
                scrollBarX = this.scrollBarX,
                sliderX = this.sliderX,
                me = this;
            //点击和拖动事件  IE11、Chrome和Firefox测试OK
            scrollBarX.onmousedown = function (e) {
                //判断鼠标点击元素  slider则为拖动，slider-bg则为点击
                if (e.target.className === "my-scrollbar-x" && me.options.events.indexOf("CLICK") > -1) {
                    let xLeft = 0;
                    if (e.offsetX < scrollBarX.offsetWidth - sliderX.offsetWidth) {
                        xLeft = e.offsetX;
                    }
                    else if (e.offsetX < scrollBarX.offsetWidth) {
                        xLeft = e.offsetX - sliderX.offsetWidth;
                    }
                    sliderX.style.marginLeft = xLeft + "px";
                    content.scrollLeft = (content.scrollWidth - content.clientWidth) * (xLeft / (content.clientWidth - sliderX.clientWidth));
                }
                else if (me.options.events.indexOf("DRAG") > -1) {
                    me.addClass(doc.querySelector("body"), "no-select");
                    let left = e.clientX - sliderX.offsetLeft;
                    document.onmousemove = function (e) {
                        me.addClass(sliderX, "slider-active");
                        var xLeft = e.clientX - left;
                        if (xLeft <= 0) {
                            xLeft = 0;
                        };
                        if (xLeft >= scrollBarX.clientWidth - sliderX.clientWidth) {
                            xLeft = scrollBarX.clientWidth - sliderX.clientWidth;
                        };
                        sliderX.style.marginLeft = xLeft + "px";
                        content.scrollLeft = (content.scrollWidth - content.clientWidth) * (xLeft / (content.clientWidth - sliderX.clientWidth));
                    }
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        me.removeClass(sliderX, "slider-active");
                        me.removeClass(doc.querySelector("body"), "no-select");
                    }
                }
            }
        },

        /**
         * 动态添加元素
         * @param {Element} elm 需要添加的DOM元素
         * @param {Number} idx 添加位置索引
         */
        addItem: function (elm, idx) {
            if (!elm) {
                return;
            }
            let children = this.target.children;
            try {
                if (children.length === 0 || idx === undefined) {
                    this.target.appendChild(elm);
                }
                else if (this.isNumber(idx) && children[parseInt(idx)]) {
                    this.target.parentNode.insertBefore(elm, children[parseInt(idx)]);
                }
                this.update();
            } catch (error) {
                alert(error);
            }
        },

        /**
         * 动态移除元素
         * @param {Number} idx 移除元素索引
         */
        removeItem: function (idx) {
            let children = this.target.children;
            if (children.length === 0 || !this.isNumber(idx)) {
                return;
            }
            try {
                this.target.removeChild(children[parseInt(idx)]);
                this.update();
            } catch (error) {
                alert(error);
            }
        },

        /**
         * 更新滚动条
         */
        update: function () {
            //更新横向滚动条高度
            if (this.options.xScrollBarEnable) {
                if (this.target.offsetWidth < this.target.scrollWidth) {
                    if (this.options.supportScroll) {
                        this.addClass(this.sliderX, "support");
                    }
                    else {
                        this.addClass(this.sliderX, "enable");
                    }
                    let w = this.target.offsetWidth / this.target.scrollWidth * this.target.offsetWidth;
                    w = w > this.options.maxScrollWidth ? this.options.maxScrollWidth : w;
                    w = w < this.options.minScrollWidth ? this.options.minScrollWidth : w;
                    this.sliderX.style.width = w + "px";
                    let left = this.target.offsetWidth - w;
                    if (parseFloat(this.sliderX.style.marginLeft) > left) {
                        this.sliderX.style.marginLeft = left + "px";
                        this.target.scrollLeft = (this.target.scrollWidth - this.target.clientWidth) * (left / (this.target.clientWidth - this.sliderX.clientWidth));
                    }
                }
                else {
                    this.removeClass(this.sliderX, "enable");
                    this.removeClass(this.sliderX, "support");
                }
            }
            //更新垂直滚动条高度
            if (this.options.yScrollBarEnable) {
                if (this.target.offsetHeight < this.target.scrollHeight) {
                    if (this.options.supportScroll) {
                        this.addClass(this.sliderY, "support");
                    }
                    else {
                        this.addClass(this.sliderY, "enable");
                    }
                    let h = this.target.offsetHeight / this.target.scrollHeight * this.target.offsetHeight;
                    h = h > this.options.maxScrollHeight ? this.options.maxScrollHeight : h;
                    h = h < this.options.minScrollHeight ? this.options.minScrollHeight : h;
                    this.sliderY.style.height = h + "px";
                    let top = this.target.offsetHeight - h;
                    if (parseFloat(this.sliderY.style.marginTop) > top) {
                        this.sliderY.style.marginTop = top + "px";
                        this.target.scrollTop = (this.target.scrollHeight - this.target.clientHeight) * (top / (this.target.clientHeight - this.sliderY.clientHeight));
                    }

                }
                else {
                    this.removeClass(this.sliderY, "enable");
                    this.removeClass(this.sliderY, "support");
                }
            }
        },

        /**
         * 销毁滚动条
         */
        destroy: function () {
            if (this.target.className.indexOf("my-scrollbar-content") < 0) {
                return;
            }
            this.removeClass(this.target, "my-scrollbar-content");
            if (this.options.xScrollBarEnable) {
                this.target.style.overflowX = "auto";
            }
            if (this.options.yScrollBarEnable) {
                this.target.style.overflowY = "auto";
            }
            let parentNode = this.target.parentNode;
            if (parentNode.parentNode) {
                parentNode.parentNode.insertBefore(this.target, parentNode);
                parentNode.parentNode.removeChild(this.target.nextSibling);
            }
        },

        /**
         * 添加样式
         * @param {Element} element element
         * @param {String} 样式名
         */
        addClass: function (element, className) {
            if (!element) {
                return;
            }
            let elmClass = element.getAttribute("class") || "";
            if (className && elmClass.indexOf(className) < 0) {
                elmClass += " " + className;
                element.setAttribute("class", elmClass.trim());
            }
        },

        /**
         * 移除样式
         * @param {Element} element element
         * @param {String} 样式名
         */
        removeClass: function (element, className) {
            if (!element) {
                return;
            }
            let elmClass = element.getAttribute("class") || "";
            if (className && elmClass.indexOf(className) > -1) {
                elmClass = elmClass.replace(className, "");
                element.setAttribute("class", elmClass.trim());
            }
        },

        /**
         * 是否为字符串
         * @param {*} value
         * @returns {Boolean}
         */
        isString: function (value) {
            return (typeof value == 'string') && value.constructor == String;
        },

        /**
        * 否为数值
        * @param {*} value
        * @returns {Boolean}
        */
        isNumber: function (value) {
            return !isNaN(parseFloat(value));
        },

        /**
         * 根据类名获取元素
         * @param {String} className Class
         * @param {Element} parent 父节点
         * @param {Boolean} isAll 是否取整个集合
         */
        getElms: function (className, parent, isAll) {
            if (!this.isString(className)) {
                return null;
            }
            let elm = parent || doc;
            return isAll ?
                elm.getElementsByClassName(className) :
                elm.getElementsByClassName(className)[0];
        },

        /**
         * 获取设备类型
         */
        getDeviceType: function () {
            if (/Android|webOS|iPhone|iPod|BlackBerry|Mobile/i.test(navigator.userAgent)) {
                return "MOBILE";
            } else {
                return "PC";
            }
        }
    }
    //将ImageCarousel挂载在window全局
    window.JSScrollBar = JSScrollBar;
}(window, document))