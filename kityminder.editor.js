/*!
 * ====================================================
 * km-editor - v0.0.1 - 2015-04-24
 * https://github.com/fex-team/kityminder-editor
 * GitHub: https://github.com/fex-team/kityminder-editor 
 * Copyright (c) 2015 ; Licensed 
 * ====================================================
 */

(function () {
var _p = {
    r: function(index) {
        if (_p[index].inited) {
            return _p[index].value;
        }
        if (typeof _p[index].value === "function") {
            var module = {
                exports: {}
            }, returnValue = _p[index].value(null, module.exports, module);
            _p[index].inited = true;
            _p[index].value = returnValue;
            if (returnValue !== undefined) {
                return returnValue;
            } else {
                for (var key in module.exports) {
                    if (module.exports.hasOwnProperty(key)) {
                        _p[index].inited = true;
                        _p[index].value = module.exports;
                        return module.exports;
                    }
                }
            }
        } else {
            _p[index].inited = true;
            return _p[index].value;
        }
    }
};

//src/editor.js
_p[0] = {
    value: function(require, exports, module) {
        /**
     * 运行时
     */
        var runtimes = [];
        function assemble(runtime) {
            runtimes.push(runtime);
        }
        function KMEditor(selector) {
            this.selector = selector;
            for (var i = 0; i < runtimes.length; i++) {
                if (typeof runtimes[i] == "function") {
                    runtimes[i].call(this, this);
                }
            }
        }
        KMEditor.assemble = assemble;
        assemble(_p.r(5));
        assemble(_p.r(6));
        assemble(_p.r(11));
        assemble(_p.r(15));
        assemble(_p.r(8));
        assemble(_p.r(9));
        assemble(_p.r(12));
        assemble(_p.r(7));
        assemble(_p.r(10));
        assemble(_p.r(13));
        assemble(_p.r(14));
        return module.exports = KMEditor;
    }
};

//src/expose-editor.js
/**
 * @fileOverview
 *
 * 打包暴露
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[1] = {
    value: function(require, exports, module) {
        return module.exports = kityminder.Editor = _p.r(0);
    }
};

//src/hotbox.js
_p[2] = {
    value: function(require, exports, module) {
        return module.exports = window.HotBox;
    }
};

//src/lang.js
_p[3] = {
    value: function(require, exports, module) {}
};

//src/minder.js
_p[4] = {
    value: function(require, exports, module) {
        return module.exports = window.kityminder.Minder;
    }
};

//src/runtime/container.js
/**
 * @fileOverview
 *
 * 初始化编辑器的容器
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[5] = {
    value: function(require, exports, module) {
        /**
     * 最先执行的 Runtime，初始化编辑器容器
     */
        function ContainerRuntime() {
            var container = document.querySelector(this.selector);
            if (!container) throw new Error("Invalid selector: " + this.selector);
            // 这个类名用于给编辑器添加样式
            container.classList.add("km-editor");
            // 暴露容器给其他运行时使用
            this.container = container;
        }
        return module.exports = ContainerRuntime;
    }
};

//src/runtime/fsm.js
/**
 * @fileOverview
 *
 * 编辑器状态机
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[6] = {
    value: function(require, exports, module) {
        var Debug = _p.r(16);
        var debug = new Debug("fsm");
        function handlerConditionMatch(condition, when, exit, enter) {
            if (condition.when != when) return false;
            if (condition.enter != "*" && condition.enter != enter) return false;
            if (condition.exit != "*" && condition.exit != exit) return;
            return true;
        }
        function FSM(defaultState) {
            var currentState = defaultState;
            var BEFORE_ARROW = " - ";
            var AFTER_ARROW = " -> ";
            var handlers = [];
            /**
         * 状态跳转
         *
         * 会通知所有的状态跳转监视器
         *
         * @param  {string} newState  新状态名称
         * @param  {any} reason 跳转的原因，可以作为参数传递给跳转监视器
         */
            this.jump = function(newState, reason) {
                if (!reason) throw new Error("Please tell fsm the reason to jump");
                var oldState = currentState;
                var notify = [ oldState, newState ].concat([].slice.call(arguments, 1));
                var i, handler;
                // 跳转前
                for (i = 0; i < handlers.length; i++) {
                    handler = handlers[i];
                    if (handlerConditionMatch(handler.condition, "before", oldState, newState)) {
                        if (handler.apply(null, notify)) return;
                    }
                }
                currentState = newState;
                debug.log("[{0}] {1} -> {2}", reason, oldState, newState);
                // 跳转后
                for (i = 0; i < handlers.length; i++) {
                    handler = handlers[i];
                    if (handlerConditionMatch(handler.condition, "after", oldState, newState)) {
                        handler.apply(null, notify);
                    }
                }
                return currentState;
            };
            /**
         * 返回当前状态
         * @return {string}
         */
            this.state = function() {
                return currentState;
            };
            /**
         * 添加状态跳转监视器
         * 
         * @param {string} condition
         *     监视的时机
         *         "* => *" （默认）
         *
         * @param  {Function} handler
         *     监视函数，当状态跳转的时候，会接收三个参数
         *         * from - 跳转前的状态
         *         * to - 跳转后的状态
         *         * reason - 跳转的原因
         */
            this.when = function(condition, handler) {
                if (arguments.length == 1) {
                    handler = condition;
                    condition = "* -> *";
                }
                var when, resolved, exit, enter;
                resolved = condition.split(BEFORE_ARROW);
                if (resolved.length == 2) {
                    when = "before";
                } else {
                    resolved = condition.split(AFTER_ARROW);
                    if (resolved.length == 2) {
                        when = "after";
                    }
                }
                if (!when) throw new Error("Illegal fsm condition: " + condition);
                exit = resolved[0];
                enter = resolved[1];
                handler.condition = {
                    when: when,
                    exit: exit,
                    enter: enter
                };
                handlers.push(handler);
            };
        }
        function FSMRumtime() {
            this.fsm = new FSM("normal");
        }
        return module.exports = FSMRumtime;
    }
};

//src/runtime/history.js
/**
 * @fileOverview
 *
 * 历史管理
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[7] = {
    value: function(require, exports, module) {
        var jsonDiff = _p.r(19);
        function HistoryRuntime() {
            var minder = this.minder;
            var hotbox = this.hotbox;
            var MAX_HISTORY = 100;
            var lastSnap;
            var patchLock;
            var undoDiffs;
            var redoDiffs;
            function reset() {
                undoDiffs = [];
                redoDiffs = [];
                lastSnap = minder.exportJson();
            }
            function makeUndoDiff() {
                var headSnap = minder.exportJson();
                var diff = jsonDiff(headSnap, lastSnap);
                if (diff.length) {
                    undoDiffs.push(diff);
                    while (undoDiffs.length > MAX_HISTORY) {
                        undoDiffs.shift();
                    }
                    lastSnap = headSnap;
                    return true;
                }
            }
            function makeRedoDiff() {
                var revertSnap = minder.exportJson();
                redoDiffs.push(jsonDiff(revertSnap, lastSnap));
                lastSnap = revertSnap;
            }
            function undo() {
                patchLock = true;
                var undoDiff = undoDiffs.pop();
                if (undoDiff) {
                    minder.applyPatches(undoDiff);
                    makeRedoDiff();
                }
                patchLock = false;
            }
            function redo() {
                patchLock = true;
                var redoDiff = redoDiffs.pop();
                if (redoDiffs) {
                    minder.applyPatches(redoDiff);
                    makeUndoDiff();
                }
                patchLock = false;
            }
            function changed() {
                if (patchLock) return;
                if (makeUndoDiff()) redoDiffs = [];
            }
            function hasUndo() {
                return !!undoDiffs.length;
            }
            function hasRedo() {
                return !!redoDiffs.length;
            }
            function updateSelection(e) {
                if (!patchLock) return;
                var patch = e.patch;
                switch (patch.express) {
                  case "node.add":
                    minder.select(patch.node.getChild(patch.index), true);
                    break;

                  case "node.remove":
                  case "data.replace":
                  case "data.remove":
                  case "data.add":
                    minder.select(patch.node, true);
                    break;
                }
            }
            this.history = {
                reset: reset,
                undo: undo,
                redo: redo,
                hasUndo: hasUndo,
                hasRedo: hasRedo
            };
            reset();
            minder.on("contentchange", changed);
            minder.on("import", reset);
            minder.on("patch", updateSelection);
            var main = hotbox.state("main");
            main.button({
                position: "top",
                label: "撤销",
                key: "Ctrl + Z",
                enable: hasUndo,
                action: undo,
                next: "idle"
            });
            main.button({
                position: "top",
                label: "重做",
                key: "Ctrl + Y",
                enable: hasRedo,
                action: redo,
                next: "idle"
            });
        }
        window.diff = jsonDiff;
        return module.exports = HistoryRuntime;
    }
};

//src/runtime/hotbox.js
/**
 * @fileOverview
 *
 * 热盒 Runtime
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[8] = {
    value: function(require, exports, module) {
        var Hotbox = _p.r(2);
        function HotboxRuntime() {
            var fsm = this.fsm;
            var minder = this.minder;
            var receiver = this.receiver;
            var container = this.container;
            var hotbox = new Hotbox(container);
            fsm.when("normal -> hotbox", function(exit, enter, reason) {
                var node = minder.getSelectedNode();
                var position;
                if (node) {
                    var box = node.getRenderBox();
                    position = {
                        x: box.cx,
                        y: box.cy
                    };
                }
                hotbox.active("main", position);
            });
            fsm.when("normal -> normal", function(exit, enter, reason, e) {
                if (reason == "shortcut-handle") {
                    var handleResult = hotbox.dispatch(e);
                    if (handleResult) {
                        e.preventDefault();
                    } else {
                        minder.dispatchKeyEvent(e);
                    }
                }
            });
            this.hotbox = hotbox;
        }
        return module.exports = HotboxRuntime;
    }
};

//src/runtime/input.js
/**
 * @fileOverview
 *
 * 文本输入支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[9] = {
    value: function(require, exports, module) {
        _p.r(18);
        var Debug = _p.r(16);
        var debug = new Debug("input");
        function InputRuntime() {
            var fsm = this.fsm;
            var minder = this.minder;
            var hotbox = this.hotbox;
            var receiver = this.receiver;
            var receiverElement = receiver.element;
            // setup everything to go
            setupReciverElement();
            setupFsm();
            setupHotbox();
            // expose editText()
            this.editText = editText;
            // listen the fsm changes, make action.
            function setupFsm() {
                // when jumped to input mode, enter
                fsm.when("* -> input", enterInputMode);
                // when exited, commit or exit depends on the exit reason
                fsm.when("input -> *", function(exit, enter, reason) {
                    switch (reason) {
                      case "input-cancel":
                        return exitInputMode();

                      case "input-commit":
                      default:
                        return commitInputResult();
                    }
                });
                // lost focus to commit
                minder.on("beforemousedown", function() {
                    if (fsm.state() == "input") {
                        fsm.jump("normal", "input-commit");
                    }
                });
                minder.on("dblclick", function() {
                    if (minder.getSelectedNode()) {
                        editText();
                    }
                });
            }
            // let the receiver follow the current selected node position
            function setupReciverElement() {
                if (debug.flaged) {
                    receiverElement.classList.add("debug");
                }
                receiverElement.onmousedown = function(e) {
                    e.stopPropagation();
                };
                minder.on("layoutallfinish viewchange viewchanged selectionchange", function(e) {
                    // viewchange event is too frequenced, lazy it
                    if (e.type == "viewchange" && fsm.state() != "input") return;
                    updatePosition();
                });
                updatePosition();
            }
            // edit entrance in hotbox
            function setupHotbox() {
                hotbox.state("main").button({
                    position: "center",
                    label: "编辑",
                    key: "F2",
                    enable: function() {
                        return minder.queryCommandState("text") != -1;
                    },
                    action: editText
                });
            }
            // edit for the selected node
            function editText() {
                receiverElement.innerText = minder.queryCommandValue("text");
                fsm.jump("input", "input-request");
                receiver.selectAll();
            }
            function enterInputMode() {
                var node = minder.getSelectedNode();
                if (node) {
                    var fontSize = node.getData("font-size") || node.getStyle("font-size");
                    receiverElement.style.fontSize = fontSize + "px";
                    receiverElement.style.minWidth = 0;
                    receiverElement.style.minWidth = receiverElement.clientWidth + "px";
                    receiverElement.classList.add("input");
                    receiverElement.focus();
                }
            }
            function commitInputResult() {
                var text = receiverElement.innerText;
                minder.execCommand("text", text.replace(/^\n*|\n*$/g, ""));
                exitInputMode();
            }
            function exitInputMode() {
                receiverElement.classList.remove("input");
                receiver.selectAll();
            }
            function updatePosition() {
                var planed = updatePosition;
                var focusNode = minder.getSelectedNode();
                if (!focusNode) return;
                if (!planed.timer) {
                    planed.timer = setTimeout(function() {
                        var box = focusNode.getRenderBox("TextRenderer");
                        receiverElement.style.left = Math.round(box.x) + "px";
                        receiverElement.style.top = (debug.flaged ? Math.round(box.bottom + 30) : Math.round(box.y)) + "px";
                        //receiverElement.focus();
                        planed.timer = 0;
                    });
                }
            }
        }
        return module.exports = InputRuntime;
    }
};

//src/runtime/jumping.js
/**
 * @fileOverview
 *
 * 根据按键控制状态机的跳转
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[10] = {
    value: function(require, exports, module) {
        var Hotbox = _p.r(2);
        // Nice: http://unixpapa.com/js/key.html
        function isIntendToInput(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return false;
            // a-zA-Z
            if (e.keyCode >= 65 && e.keyCode <= 90) return true;
            // 0-9 以及其上面的符号
            if (e.keyCode >= 48 && e.keyCode <= 57) return true;
            // 输入法
            if (e.keyCode == 229) return true;
        }
        function JumpingRuntime() {
            var fsm = this.fsm;
            var minder = this.minder;
            var receiver = this.receiver;
            var container = this.container;
            var receiverElement = receiver.element;
            var hotbox = this.hotbox;
            // normal -> *
            receiver.listen("normal", function(e) {
                // normal -> hotbox
                if (e.type == "keydown" && e.is("Space")) {
                    e.preventDefault();
                    return fsm.jump("hotbox", "space-trigger");
                }
                // normal -> input
                if (e.type == "keydown" && isIntendToInput(e)) {
                    if (minder.getSelectedNode()) {
                        return fsm.jump("input", "user-input");
                    } else {
                        receiverElement.innerHTML = "";
                    }
                }
                // normal -> normal
                if (e.type == "keydown") {
                    return fsm.jump("normal", "shortcut-handle", e);
                }
            });
            // hotbox -> normal
            receiver.listen("hotbox", function(e) {
                e.preventDefault();
                var handleResult = hotbox.dispatch(e);
                if (hotbox.state() == Hotbox.STATE_IDLE && fsm.state() == "hotbox") {
                    return fsm.jump("normal", "hotbox-idle");
                }
            });
            // input => normal
            receiver.listen("input", function(e) {
                if (e.type == "keydown") {
                    if (e.is("Enter")) {
                        e.preventDefault();
                        return fsm.jump("normal", "input-commit");
                    }
                    if (e.is("Esc")) {
                        e.preventDefault();
                        return fsm.jump("normal", "input-cancel");
                    }
                    if (e.is("Tab") || e.is("Shift + Tab")) {
                        e.preventDefault();
                    }
                }
            });
            //////////////////////////////////////////////
            /// 右键呼出热盒
            /// 判断的标准是：按下的位置和结束的位置一致
            //////////////////////////////////////////////
            var downX, downY;
            var MOUSE_RB = 2;
            // 右键
            container.addEventListener("mousedown", function(e) {
                if (fsm.state() == "hotbox") {
                    hotbox.active(Hotbox.STATE_IDLE);
                    fsm.jump("normal", "blur");
                } else if (fsm.state() == "normal" && e.button == MOUSE_RB) {
                    downX = e.clientX;
                    downY = e.clientY;
                }
            }, false);
            container.addEventListener("mouseup", function(e) {
                if (fsm.state() != "normal") {
                    return;
                }
                if (e.button != MOUSE_RB || e.clientX != downX || e.clientY != downY) {
                    return;
                }
                if (!minder.getSelectedNode()) {
                    return;
                }
                fsm.jump("hotbox", "content-menu");
            }, false);
            // 阻止热盒事件冒泡，在热盒正确执行前导致热盒关闭
            hotbox.$element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            });
        }
        return module.exports = JumpingRuntime;
    }
};

//src/runtime/minder.js
/**
 * @fileOverview
 *
 * 脑图示例运行时
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[11] = {
    value: function(require, exports, module) {
        var Minder = _p.r(4);
        function MinderRuntime() {
            // 不使用 kityminder 的按键处理，由 ReceiverRuntime 统一处理
            var minder = new Minder({
                enableKeyReceiver: false,
                enableAnimation: false
            });
            // 渲染，初始化
            minder.renderTo(this.selector);
            minder.setTheme(null);
            minder.select(minder.getRoot(), true);
            minder.execCommand("text", "中心主题");
            // 导出给其它 Runtime 使用
            this.minder = minder;
        }
        return module.exports = MinderRuntime;
    }
};

//src/runtime/node.js
_p[12] = {
    value: function(require, exports, module) {
        function NodeRuntime() {
            var runtime = this;
            var minder = this.minder;
            var hotbox = this.hotbox;
            var fsm = this.fsm;
            var main = hotbox.state("main");
            var buttons = [ "前移:Alt+Up:ArrangeUp", "下级:Tab:AppendChildNode", "同级:Enter:AppendSiblingNode", "后移:Alt+Down:ArrangeDown", "删除:Delete|Backspace:RemoveNode", "归纳:Shift+Tab|Shift+Insert:AppendParentNode" ];
            buttons.forEach(function(button) {
                var parts = button.split(":");
                var label = parts.shift();
                var key = parts.shift();
                var command = parts.shift();
                main.button({
                    position: "ring",
                    label: label,
                    key: key,
                    action: function() {
                        if (command.indexOf("Append") === 0) {
                            minder.execCommand(command, "新主题");
                            // provide in input runtime
                            runtime.editText();
                        } else {
                            minder.execCommand(command);
                            fsm.jump("normal", "command-executed");
                        }
                    },
                    enable: function() {
                        return minder.queryCommandState(command) != -1;
                    }
                });
            });
            main.button({
                position: "ring",
                key: "/",
                action: function() {
                    if (!minder.queryCommandState("expand")) {
                        minder.execCommand("expand");
                    } else if (!minder.queryCommandState("collapse")) {
                        minder.execCommand("collapse");
                    }
                },
                enable: function() {
                    return minder.queryCommandState("expand") != -1 || minder.queryCommandState("collapse") != -1;
                },
                beforeShow: function() {
                    if (!minder.queryCommandState("expand")) {
                        this.$button.children[0].innerHTML = "展开";
                    } else {
                        this.$button.children[0].innerHTML = "收起";
                    }
                }
            });
        }
        return module.exports = NodeRuntime;
    }
};

//src/runtime/priority.js
_p[13] = {
    value: function(require, exports, module) {
        function PriorityRuntime() {
            var minder = this.minder;
            var hotbox = this.hotbox;
            var main = hotbox.state("main");
            main.button({
                position: "top",
                label: "优先级",
                key: "P",
                next: "priority"
            });
            var priority = hotbox.state("priority");
            "123456789".replace(/./g, function(p) {
                priority.button({
                    position: "ring",
                    label: "P" + p,
                    key: p,
                    action: function() {
                        minder.execCommand("Priority", p);
                    }
                });
            });
            priority.button({
                position: "center",
                label: "移除",
                key: "Del",
                action: function() {
                    minder.execCommand("Priority", 0);
                }
            });
            priority.button({
                position: "top",
                label: "返回",
                key: "esc",
                next: "back"
            });
        }
        module.exports = PriorityRuntime;
    }
};

//src/runtime/progress.js
_p[14] = {
    value: function(require, exports, module) {
        function ProgressRuntime() {
            var minder = this.minder;
            var hotbox = this.hotbox;
            var main = hotbox.state("main");
            main.button({
                position: "top",
                label: "进度",
                key: "G",
                next: "progress"
            });
            var progress = hotbox.state("progress");
            "012345678".replace(/./g, function(p) {
                progress.button({
                    position: "ring",
                    label: "G" + p,
                    key: p,
                    action: function() {
                        minder.execCommand("Progress", parseInt(p) + 1);
                    }
                });
            });
            progress.button({
                position: "center",
                label: "移除",
                key: "Del",
                action: function() {
                    minder.execCommand("Progress", 0);
                }
            });
            progress.button({
                position: "top",
                label: "返回",
                key: "esc",
                next: "back"
            });
        }
        module.exports = ProgressRuntime;
    }
};

//src/runtime/receiver.js
/**
 * @fileOverview
 *
 * 键盘事件接收/分发器
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[15] = {
    value: function(require, exports, module) {
        var key = _p.r(20);
        function ReceiverRuntime() {
            var fsm = this.fsm;
            var minder = this.minder;
            // 接收事件的 div
            var element = document.createElement("div");
            element.contentEditable = true;
            element.classList.add("receiver");
            element.onkeydown = element.onkeypress = element.onkeyup = dispatchKeyEvent;
            this.container.appendChild(element);
            // receiver 对象
            var receiver = {
                element: element,
                selectAll: function() {
                    // 保证有被选中的
                    if (!element.innerHTML) element.innerHTML = "&nbsp;";
                    var range = document.createRange();
                    var selection = window.getSelection();
                    range.selectNodeContents(element);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    element.focus();
                }
            };
            receiver.selectAll();
            minder.on("beforemousedown", receiver.selectAll);
            // 侦听器，接收到的事件会派发给所有侦听器
            var listeners = [];
            // 侦听指定状态下的事件，如果不传 state，侦听所有状态
            receiver.listen = function(state, listener) {
                if (arguments.length == 1) {
                    listener = state;
                    state = "*";
                }
                listener.notifyState = state;
                listeners.push(listener);
            };
            function dispatchKeyEvent(e) {
                e.is = function(keyExpression) {
                    var subs = keyExpression.split("|");
                    for (var i = 0; i < subs.length; i++) {
                        if (key.is(this, subs[i])) return true;
                    }
                    return false;
                };
                var listener, jumpState;
                for (var i = 0; i < listeners.length; i++) {
                    listener = listeners[i];
                    // 忽略不在侦听状态的侦听器
                    if (listener.notifyState != "*" && listener.notifyState != fsm.state()) {
                        continue;
                    }
                    /**
                 *
                 * 对于所有的侦听器，只允许一种处理方式：跳转状态。
                 * 如果侦听器确定要跳转，则返回要跳转的状态。
                 * 每个事件只允许一个侦听器进行状态跳转
                 * 跳转动作由侦听器自行完成（因为可能需要在跳转时传递 reason），返回跳转结果即可。
                 * 比如：
                 *
                 * ```js
                 *  receiver.listen('normal', function(e) {
                 *      if (isSomeReasonForJumpState(e)) {
                 *          return fsm.jump('newstate', e);
                 *      }
                 *  });
                 * ```
                 */
                    if (listener.call(null, e)) {
                        return;
                    }
                }
            }
            this.receiver = receiver;
        }
        return module.exports = ReceiverRuntime;
    }
};

//src/tool/debug.js
/**
 * @fileOverview
 *
 * 支持各种调试后门
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[16] = {
    value: function(require, exports, module) {
        var format = _p.r(17);
        function noop() {}
        function stringHash(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i);
            }
            return hash;
        }
        /* global console */
        function Debug(flag) {
            var debugMode = this.flaged = window.location.search.indexOf(flag) != -1;
            if (debugMode) {
                var h = stringHash(flag) % 360;
                var flagStyle = format("background: hsl({0}, 50%, 80%); " + "color: hsl({0}, 100%, 30%); " + "padding: 2px 3px; " + "margin: 1px 3px 0 0;" + "border-radius: 2px;", h);
                var textStyle = "background: none; color: black;";
                this.log = function() {
                    var output = format.apply(null, arguments);
                    console.log(format("%c{0}%c{1}", flag, output), flagStyle, textStyle);
                };
            } else {
                this.log = noop;
            }
        }
        return module.exports = Debug;
    }
};

//src/tool/format.js
_p[17] = {
    value: function(require, exports, module) {
        function format(template, args) {
            if (typeof args != "object") {
                args = [].slice.call(arguments, 1);
            }
            return String(template).replace(/\{(\w+)\}/gi, function(match, $key) {
                return args[$key] || $key;
            });
        }
        return module.exports = format;
    }
};

//src/tool/innertext.js
/**
 * @fileOverview
 *
 * innerText polyfill
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[18] = {
    value: function(require, exports, module) {
        if (!("innerText" in document.createElement("a")) && "getSelection" in window) {
            HTMLElement.prototype.__defineGetter__("innerText", function() {
                var selection = window.getSelection(), ranges = [], str, i;
                // Save existing selections.
                for (i = 0; i < selection.rangeCount; i++) {
                    ranges[i] = selection.getRangeAt(i);
                }
                // Deselect everything.
                selection.removeAllRanges();
                // Select `el` and all child nodes.
                // 'this' is the element .innerText got called on
                selection.selectAllChildren(this);
                // Get the string representation of the selected nodes.
                str = selection.toString();
                // Deselect everything. Again.
                selection.removeAllRanges();
                // Restore all formerly existing selections.
                for (i = 0; i < ranges.length; i++) {
                    selection.addRange(ranges[i]);
                }
                // Oh look, this is what we wanted.
                // String representation of the element, close to as rendered.
                return str;
            });
            HTMLElement.prototype.__defineSetter__("innerText", function(text) {
                this.innerHTML = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            });
        }
    }
};

//src/tool/jsondiff.js
/**
 * @fileOverview
 *
 *
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
_p[19] = {
    value: function(require, exports, module) {
        /*!
    * https://github.com/Starcounter-Jack/Fast-JSON-Patch
    * json-patch-duplex.js 0.5.0
    * (c) 2013 Joachim Wester
    * MIT license
    */
        var _objectKeys = function() {
            if (Object.keys) return Object.keys;
            return function(o) {
                var keys = [];
                for (var i in o) {
                    if (o.hasOwnProperty(i)) {
                        keys.push(i);
                    }
                }
                return keys;
            };
        }();
        function escapePathComponent(str) {
            if (str.indexOf("/") === -1 && str.indexOf("~") === -1) return str;
            return str.replace(/~/g, "~0").replace(/\//g, "~1");
        }
        function deepClone(obj) {
            if (typeof obj === "object") {
                return JSON.parse(JSON.stringify(obj));
            } else {
                return obj;
            }
        }
        // Dirty check if obj is different from mirror, generate patches and update mirror
        function _generate(mirror, obj, patches, path) {
            var newKeys = _objectKeys(obj);
            var oldKeys = _objectKeys(mirror);
            var changed = false;
            var deleted = false;
            for (var t = oldKeys.length - 1; t >= 0; t--) {
                var key = oldKeys[t];
                var oldVal = mirror[key];
                if (obj.hasOwnProperty(key)) {
                    var newVal = obj[key];
                    if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                        _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key));
                    } else {
                        if (oldVal != newVal) {
                            changed = true;
                            patches.push({
                                op: "replace",
                                path: path + "/" + escapePathComponent(key),
                                value: deepClone(newVal)
                            });
                        }
                    }
                } else {
                    patches.push({
                        op: "remove",
                        path: path + "/" + escapePathComponent(key)
                    });
                    deleted = true;
                }
            }
            if (!deleted && newKeys.length == oldKeys.length) {
                return;
            }
            for (var t = 0; t < newKeys.length; t++) {
                var key = newKeys[t];
                if (!mirror.hasOwnProperty(key)) {
                    patches.push({
                        op: "add",
                        path: path + "/" + escapePathComponent(key),
                        value: deepClone(obj[key])
                    });
                }
            }
        }
        function compare(tree1, tree2) {
            var patches = [];
            _generate(tree1, tree2, patches, "");
            return patches;
        }
        return module.exports = compare;
    }
};

//src/tool/key.js
_p[20] = {
    value: function(require, exports, module) {
        var keymap = _p.r(21);
        var CTRL_MASK = 4096;
        var ALT_MASK = 8192;
        var SHIFT_MASK = 16384;
        function hash(unknown) {
            if (typeof unknown == "string") {
                return hashKeyExpression(unknown);
            }
            return hashKeyEvent(unknown);
        }
        function is(a, b) {
            return a && b && hash(a) == hash(b);
        }
        exports.hash = hash;
        exports.is = is;
        function hashKeyEvent(keyEvent) {
            var hashCode = 0;
            if (keyEvent.ctrlKey || keyEvent.metaKey) {
                hashCode |= CTRL_MASK;
            }
            if (keyEvent.altKey) {
                hashCode |= ALT_MASK;
            }
            if (keyEvent.shiftKey) {
                hashCode |= SHIFT_MASK;
            }
            // Shift, Control, Alt KeyCode ignored.
            if ([ 16, 17, 18, 91 ].indexOf(keyEvent.keyCode) == -1) {
                hashCode |= keyEvent.keyCode;
            }
            return hashCode;
        }
        function hashKeyExpression(keyExpression) {
            var hashCode = 0;
            keyExpression.toLowerCase().split(/\s*\+\s*/).forEach(function(name) {
                switch (name) {
                  case "ctrl":
                  case "cmd":
                    hashCode |= CTRL_MASK;
                    break;

                  case "alt":
                    hashCode |= ALT_MASK;
                    break;

                  case "shift":
                    hashCode |= SHIFT_MASK;
                    break;

                  default:
                    hashCode |= keymap[name];
                }
            });
            return hashCode;
        }
    }
};

//src/tool/keymap.js
_p[21] = {
    value: function(require, exports, module) {
        var keymap = {
            Shift: 16,
            Control: 17,
            Alt: 18,
            CapsLock: 20,
            BackSpace: 8,
            Tab: 9,
            Enter: 13,
            Esc: 27,
            Space: 32,
            PageUp: 33,
            PageDown: 34,
            End: 35,
            Home: 36,
            Insert: 45,
            Left: 37,
            Up: 38,
            Right: 39,
            Down: 40,
            Direction: {
                37: 1,
                38: 1,
                39: 1,
                40: 1
            },
            Del: 46,
            NumLock: 144,
            Cmd: 91,
            CmdFF: 224,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            "`": 192,
            "=": 187,
            "-": 189,
            "/": 191,
            ".": 190
        };
        // 小写适配
        for (var key in keymap) {
            if (keymap.hasOwnProperty(key)) {
                keymap[key.toLowerCase()] = keymap[key];
            }
        }
        var aKeyCode = 65;
        var aCharCode = "a".charCodeAt(0);
        // letters
        "abcdefghijklmnopqrstuvwxyz".split("").forEach(function(letter) {
            keymap[letter] = aKeyCode + (letter.charCodeAt(0) - aCharCode);
        });
        // numbers
        var n = 9;
        do {
            keymap[n.toString()] = n + 48;
        } while (--n);
        module.exports = keymap;
    }
};

var moduleMapping = {
    "expose-editor": 1
};

function use(name) {
    _p.r([ moduleMapping[name] ]);
}
use('expose-editor');
})();