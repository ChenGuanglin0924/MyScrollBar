(function(win, doc) {
    /**
     * 原生js滚动条插件
     * scrollSpeed      {number} 滚动速度
     * xScrollBarEnable {boolean} 横向滚动条是否可用
     * yScrollBarEnable {boolean} 垂直滚动条是否可用
     * wheelPropagation {boolean} 滚动事件是否冒泡
     */
    let MyScrollBar = function(target, options) {
        let defaults = {
            scrollSpeed: 10,
            xScrollBarEnable: true,
            yScrollBarEnable: true,
            wheelPropagation: true
        };
        this.target = target;  //必须  需要创建滚动条的DOM元素
        this.options = Object.assign({}, defaults, options);
    }
    MyScrollBar.prototype = {
        /**
         * 初始化函数
         */
        init: function() {
            this.renderDOM();
        },
        /**
         * 渲染DOM
         */
        renderDOM: function() {
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

            //生成横向滚动条并绑定事件
            this.options.xScrollBarEnable && this.createXScrollBar(container);
            //生成垂直滚动条并绑定事件
            this.options.yScrollBarEnable && this.createYScrollBar(container);
        },

        /**
         * 创建垂直滚动条
         * @param {Element} container 滚动条容器
         */
        createYScrollBar: function(container) {
            let scrollBarY = doc.createElement("div");
            scrollBarY.className = "my-scrollbar-y";
            let sliderY = doc.createElement("div");
            sliderY.className = "y-slider";
            scrollBarY.appendChild(sliderY);
            container.appendChild(scrollBarY);

            //内容容器
            let content = this.getElms("my-scrollbar-content", container);
            //容器可视高度小于实际高度时，再绑定事件
            if (content.clientHeight < content.scrollHeight) {
                this.addClass(sliderY, "slider-enable");
                //绑定滚轮事件
                this.bindYWheelEvent(content, sliderY);
                //绑定点击事件
                this.bindYClickEvent(content, scrollBarY, sliderY);
            }
        },

        /**
         * 垂直滚动条滚轮事件
         */
        bindYWheelEvent: function(content, sliderY) {
            //判断浏览器
            let isIE = navigator.userAgent.match(/MSIE (\d)/i);
            isIE = isIE ? isIE[1] : undefined;
            let isFF = /FireFox/i.test(navigator.userAgent);
            let me = this;
            if (isIE < 9) //传统浏览器使用MouseWheel事件
            {
                content.attachEvent("onmousewheel", function (e) {
                    //计算鼠标滚轮滚动的距离
                    let v = e.wheelDelta / 120 * me.options.scrollSpeed;
                    content.scrollTop += v;
                    sliderY.style.marginTop = (content.clientHeight - sliderY.clientHeight) * (content.scrollTop / (content.scrollHeight - content.clientHeight)) + "px";
                    //阻止冒泡
                    if (!me.options.wheelPropagation || content.scrollTop> 0 && (content.scrollTop < content.scrollHeight - content.clientHeight)) {
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
                    if (!me.options.wheelPropagation || content.scrollTop> 0 && (content.scrollTop < content.scrollHeight - content.clientHeight)) {
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
        bindYClickEvent: function(content, scrollBarY, sliderY) {
            let me = this;
            //点击和拖动事件  IE11、Chrome和Firefox测试OK
            scrollBarY.onmousedown = function(e) {
                //判断鼠标点击元素  slider则为拖动，slider-bg则为点击
                if(e.target.className === "my-scrollbar-y") {
                    let yTop = 0;
                    if(e.offsetY < scrollBarY.offsetHeight - sliderY.offsetHeight) {
                        yTop = e.offsetY;
                    }
                    else if(e.offsetY < scrollBarY.offsetHeight) {
                        yTop = e.offsetY - sliderY.offsetHeight;
                    }
                    sliderY.style.marginTop = yTop + "px";
                    content.scrollTop = (content.scrollHeight - content.clientHeight) * (yTop / (content.clientHeight - sliderY.clientHeight));
                }
                else {
                    me.addClass(doc.querySelector("body"), "no-select");
                    let top = e.clientY - sliderY.offsetTop;
                    document.onmousemove = function(e) {
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
                    document.onmouseup = function (){
                        document.onmousemove = null;
                        me.removeClass(sliderY, "slider-active");
                        me.removeClass(doc.querySelector("body"), "no-select");
                    }
                }
            }
        },

        /**
         * 创建横向滚动条
         * @param {Element} container 滚动条容器
         */
        createXScrollBar: function(container) {
            let scrollBarX = doc.createElement("div");
            scrollBarX.className = "my-scrollbar-x";
            let sliderX = doc.createElement("div");
            sliderX.className = "x-slider";
            scrollBarX.appendChild(sliderX);
            container.appendChild(scrollBarX);

            //内容容器
            let content = this.getElms("my-scrollbar-content", container);
            //容器可视高度小于实际高度时，再绑定事件
            if (content.clientWidth < content.scrollWidth) {
                this.addClass(sliderX, "slider-enable");
                //绑定滚轮事件
                this.bindXWheelEvent(content, sliderX);
                //绑定点击事件
                this.bindXClickEvent(content, scrollBarX, sliderX);
            }
        },
        
        /**
         * 横向滚动条滚轮事件
         */
        bindXWheelEvent: function(content, sliderX) {
            //判断浏览器
            let isIE = navigator.userAgent.match(/MSIE (\d)/i);
            isIE = isIE ? isIE[1] : undefined;
            let isFF = /FireFox/i.test(navigator.userAgent);
            let me = this;
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
        bindXClickEvent: function(content, scrollBarX, sliderX) {
            let me = this;
            //点击和拖动事件  IE11、Chrome和Firefox测试OK
            scrollBarX.onmousedown = function(e) {
                //判断鼠标点击元素  slider则为拖动，slider-bg则为点击
                if(e.target.className === "my-scrollbar-x") {
                    let xLeft = 0;
                    if(e.offsetX < scrollBarX.offsetWidth - sliderX.offsetWidth) {
                        xLeft = e.offsetX;
                    }
                    else if(e.offsetX < scrollBarX.offsetWidth) {
                        xLeft = e.offsetX - sliderX.offsetWidth;
                    }
                    sliderX.style.marginLeft = xLeft + "px";
                    content.scrollLeft = (content.scrollWidth - content.clientWidth) * (xLeft / (content.clientWidth - sliderX.clientWidth));
                }
                else {
                    me.addClass(doc.querySelector("body"), "no-select");
                    let left = e.clientX - sliderX.offsetLeft;
                    document.onmousemove = function(e) {
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
                    document.onmouseup = function (){
                        document.onmousemove = null;
                        me.removeClass(sliderX, "slider-active");
                        me.removeClass(doc.querySelector("body"), "no-select");
                    }
                }
            }
        },

        /**
         * 添加样式
         * @param {Element} element element
         * @param {String} 样式名
         */
        addClass: function(element, className) {
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
        removeClass: function(element, className) {
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
        isString: function(value) {
            return (typeof value == 'string') && value.constructor == String;
        },

        /**
         * 动态添加元素
         * @param {Element} elm
         */
        addItem: function(elm) {
            this.target.appendChild(elm);
            this.update();
        },

        /**
         * 更新滚动条
         */
        update: function() {

        },

        /**
         * 销毁滚动条
         */
        destroy: function() {
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
         * 根据类名获取元素
         * @param {String} className Class
         * @param {Element} parent 父节点
         * @param {Boolean} isAll 是否取整个集合
         */
        getElms: function(className, parent, isAll) {
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
        getDeviceType: function() {
            if(/Android|webOS|iPhone|iPod|BlackBerry|Mobile/i.test(navigator.userAgent)) {
                return "MOBILE";
            } else {
                return "PC";
            }
        }
    }
    //将ImageCarousel挂载在window全局
    window.MyScrollBar = MyScrollBar;
}(window, document))