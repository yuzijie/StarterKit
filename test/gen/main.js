(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var alert;

var Alert = function (template, target) {
    var that = this;
    target = target || $(document.body);

    // custom action
    this.showAction = null;

    // new Insert Object
    alert = new Insert(template, target);

    alert.onInsert(function ($el) {
        if (that.showAction) that.showAction($el);

        $el.data("float", new Floatbox($el));
        $el.data("float").addListener('button[data-type="close"]', "click", function () {
            that.hide();
        });

        $el.data("float").open();
    }).onDestroy(function ($el) {
        $el.data("float").close();
    });
};

Alert.prototype.show = function (data) {
    var aid = alert.$target.data("alert-id");
    if (!$.isNumeric(aid)) {
        aid = alert.insert(data);
        alert.$target.data("alert-id", aid);
        return alert.$elements[aid];
    }
    return null;
};

Alert.prototype.hide = function (target) {
    target = target || alert.$target;
    var id = to$(target).data("alert-id");
    if ($.isNumeric(id)) {
        alert.destroy(id);
        target.data("alert-id", "");
    }
    return this;
};

Alert.prototype.changeTarget = function (target) {
    alert.changeTarget(target);
    return this;
};

Alert.prototype.changeContent = function (data, target) {
    target = target || alert.$target;

    var $target = to$(target);
    var id = $target.data("alert-id");

    if ($.isNumeric(id)) {
        id = alert.reinsert(data, id);
        $target.data("alert-id", id);
    }
    return alert.$elements[id];
};

Alert.prototype.getByTarget = function (target) {
    target = target || alert.$target;
    var id = to$(target).data("alert-id");
    return alert.$elements[id];
};

Alert.prototype.onShow = function (func) {
    if ($.isFunction(func)) this.showAction = func;
    return this;
};

module.exports = Alert;

},{"./float-box.js":5,"./insert.js":9}],2:[function(require,module,exports){
var h = require("./helper");

function getSec(value) {
    return value.slice(0, -1) * 1000;
}

function testAnim($el) {
    // for transition
    var duration = $el.css("transition-duration");
    if (duration) return {type: "t", duration: getSec(duration)};

    // for animation
    duration = $el.css("animation-duration");
    if (duration) return {type: "a", duration: getSec(duration)};

    // last
    return {type: null, duration: 0};
}

var sup = {
    animation: h.isSupport("animation") || h.isSupport("webkitAnimation"),
    transform: h.isSupport("transform") || h.isSupport("webkitTransform"),
    animationEnd: h.isSupport("animation") ? "animationend" : "webkitAnimationEnd"
};

function finish(element, func, enable) {
    if (!$.isFunction(func)) throw "Finish function error!";
    var $el = h.to$(element);

    var anim = testAnim($el);
    switch (anim) {
        case "t":
            $el.one("transitionend", func);
            if (!sup.transform || enable === false) { // 如果没有 transform support，就自动认为没有 transition support
                $el.trigger("transitionend");
                return 0;
            }
            return anim.duration;
        case "a":
            $el.one(sup.animationEnd, func);
            if (!sup.animation || enable === false) {
                $el.trigger(sup.animationEnd);
                return 0;
            }
            return anim.duration;
        default:
            func();
            return 0;
    }
}

module.exports = {
    finish: finish,
    transform: h.isSupport("transform") ? "transform" : "-webkit-transform",
    supportAnimation: sup.animation,
    supportTransition: sup.transform
};

},{"./helper":8}],3:[function(require,module,exports){
var h = require("./helper"),
    anim = require("./anim"),
    overlay = require("./overlay");

// close box when clicking outside of it
function closeOnClick($box, id) {
    $(window).on("click." + id, function (e) {
        if (!h.within(e.target, $box)) $box.trigger("close", {box: $box});
    });
}

// close box when page is scrolling
function closeOnScroll($box, id) {
    $(window).on("scroll." + id, function () {
        $box.trigger("close", {enableAnim: false, box: $box});
    });
}

// turn element into box
module.exports.transform = function (box, options) {
    if (!box) throw "box.on: Missing Box Element!";

    var $box = h.to$(box), id = h.r4(), preventClose = false,
        opts = $.extend({openClass: "box--open", closeClass: "box--close"}, options);

    // open action
    function open() {
        if ($box.is(":hidden")) {
            var allow, info = arguments[1] || {};
            if (opts["beforeOpen"]) allow = opts["beforeOpen"](info);

            if (allow !== false) {
                // open the box
                if (opts.hasOverlay === true) overlay.on();
                $box.show().addClass(opts.openClass);

                // set animation finish action
                anim.finish($box, function () {
                    if (opts["afterOpen"]) opts["afterOpen"](info);
                });

                // set listeners
                setTimeout(function () { // 防止添加 listener 太早，从而 trigger close event
                    if (opts.closeOnClick === true) closeOnClick($box, id);
                    if (opts.closeOnScroll === true) closeOnScroll($box, id);
                }, 50);
            }
        }
        prevent(); // prevent close
        return false;
    }

    // close action
    function close() {
        if ($box.is(":visible") && preventClose === false) {
            var allow, duration, info = arguments[1] || {};
            if (opts["beforeClose"]) allow = opts["beforeClose"](info);

            if (allow !== false) {
                // close the box
                $box.removeClass(opts.openClass).addClass(opts.closeClass);
                if (opts.hasOverlay === true) overlay.off();

                // set animation finish action
                duration = anim.finish($box, function () {
                    $box.removeClass(opts.closeClass).hide();
                    if (opts["afterClose"]) opts["afterClose"](info);
                }, info.enableAnim);

                // reset listeners
                $(window).off("." + id);

                // prevent close
                prevent(duration);
            }
            return true;
        }
        return false;
    }

    // assign events
    $box.on({
        open: open,
        close: close,
        toggle: function (event, info) {
            if (!close(event, info)) open(event, info);
        }
    });

    // close on leave
    if (opts.closeOnLeave === true) $box.on("mouseleave", function () {
        $box.trigger("close", {box: $box});
    });

    // assign close button
    $box.on("click", "[data-box-close]", function () {
        $box.trigger("close", {box: $box});
    });

    // helper functions
    function prevent(t) { // prevent close
        preventClose = true;
        setTimeout(function () {
            preventClose = false;
        }, t || 100);
    }
};

},{"./anim":2,"./helper":8,"./overlay":11}],4:[function(require,module,exports){
var h = require("./helper");

var $elements = {}, // list of elements that have been inserted
    index = 0; // index of new element

function insert(element, target, method, afterInsert) {
    if (!element || !target) throw "element or target missing!";
    var $target = h.to$(target), $element = h.to$(element);

    // add to DOM
    $target[method]($element.data("domId", ++index));

    // cache element
    $elements[index] = $element;

    // after insert
    if (afterInsert) afterInsert($element);

    // return index number
    return index;
}

function remove(IDorEL, beforeRemove) {
    var index;

    if ($.isNumeric(IDorEL)) {
        index = IDorEL;
    } else {
        index = h.to$(IDorEL).data("domId");
    }

    if (!index) throw "no dom id!";

    if ($elements.hasOwnProperty(index)) {
        var allow, $element = $elements[index];

        // before remove
        if (beforeRemove) allow = beforeRemove($element);

        if (allow !== false) {
            // delete cache
            delete $elements[index];

            // remove from DOM
            $element.remove();

            return true;
        }
    }
    return false;
}

function element(index) {
    if ($elements.hasOwnProperty(index)) return $elements[index];
    if (index === "all") return $elements;
    return false;
}

module.exports = {
    append: function (element, target, func) {
        return insert(element, target, "append", func);
    },
    prepend: function (element, target, func) {
        return insert(element, target, "prepend", func);
    },
    before: function (element, target, func) {
        return insert(element, target, "before", func);
    },
    after: function (element, target, func) {
        return insert(element, target, "after", func);
    },
    remove: remove, element: element
};

},{"./helper":8}],5:[function(require,module,exports){
var prevent = require("./prevent-scroll");
var scrollbar = require("./scrollbar");
var Listener = require("./listener");
var $body = $(document.body);

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function handle(option, func) {
    if (option.constructor === Array) {
        $.each(option, function (index, value) {
            func(value);
        });
    } else func(option);
}

// Float box Class
var FloatBox = function (box, options) {
    this.self = to$(box);
    var that = this;

    // Options
    options = options || {};
    this.opts = $.extend({
        closeOnScroll: false,  // Close box on page scrolling
        closeOnClick: false,   // Close box when clicking outside of it
        closeOnLeave: false,   // Close box after mouse left box area
        hasOverlay: false      // Box has overlay or not
    }, options);

    // Prevent Scroll
    if (options.preventScroll) {
        handle(options.preventScroll, function (item) {
            prevent(that.self.find(item));
        });
    } else prevent(that.self.children());

    // Custom actions
    this.boxOpenAction = null;
    this.boxCloseAction = null;

    // add custom Listeners
    this.customListener = new Listener("floatBox", this.self);
};

FloatBox.prototype.setListener = function () {
    var that = this;

    // Close box when clicking outside of it
    if (that.opts.closeOnClick === true) {
        $(document).on("click.floatBox", function (e) {
            if (!that.self.is(e.target) && that.self.has(e.target).length === 0) {
                that.close();
            }
        });
    }
    //Close menu on page scrolling
    if (that.opts.closeOnScroll === true) {
        $(window).on("scroll.floatBox", function () {
            that.close();
        });
    }

    // Close box after mouse left the box area
    if (that.opts.closeOnLeave === true) {
        that.self.on("mouseleave.floatBox", function () {
            that.close();
        });
    }

    // custom listeners
    this.customListener.on();
};

FloatBox.prototype.resetListener = function () {
    if (this.opts.closeOnClick === true) $(document).off("click.floatBox");
    if (this.opts.closeOnScroll === true) $(window).off("scroll.floatBox");
    if (this.opts.closeOnLeave === true) this.self.off("mouseleave.floatBox");
    this.customListener.off();
    return this;
};

FloatBox.prototype.open = function () {
    if (this.self.is(":hidden")) {
        this.self.show();
        if (this.opts.hasOverlay === true) {
            scrollbar.setPadding();
            $body.addClass("overlay");
        }
        if (this.boxOpenAction) this.boxOpenAction();
        var that = this;
        setTimeout(function () {
            that.setListener();
        }, 50);
        return true;
    }
    return false;
};

FloatBox.prototype.close = function () {
    if (this.self.is(":visible")) {
        this.self.hide();
        if (this.opts.hasOverlay === true) {
            scrollbar.resetPadding();
            $body.removeClass("overlay");
        }
        this.resetListener();
        if (this.boxCloseAction) this.boxCloseAction();
        return true;
    }
    return false;
};

FloatBox.prototype.toggle = function () {
    if (!this.open()) this.close();
    return this;
};

FloatBox.prototype.onOpen = function (func) {
    if ($.isFunction(func)) this.boxOpenAction = func;
    return this;
};

FloatBox.prototype.onClose = function (func) {
    if ($.isFunction(func)) this.boxCloseAction = func;
    return this;
};

FloatBox.prototype.addListener = function (target, event, func) {
    this.customListener.add(target, event, func);
    return this;
};

FloatBox.prototype.addCloseButton = function (target) {
    var that = this;
    this.addListener(target, "click", function () {
        that.close();
    });
    return this;
};

module.exports = FloatBox;

},{"./listener":10,"./prevent-scroll":12,"./scrollbar":14}],6:[function(require,module,exports){
var Form = require("./form");
var Alert = require("./alert");
var scrollTo = require("./scroll-to");
var tooltipTemplate = require("../templates/tooltip.hbs");

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function getInfo($element) {
    var output = [];

    // get text
    var suggestion = $element.data("suggestion");
    var error = $element.data("validation-error");

    // error output
    if (error && error !== "required") output.push(error);
    if (suggestion) output.push(suggestion);

    // return string
    return output.join("<br>");
}

var BetterForm = function (target) {
    var that = this;
    this.self = to$(target);

    this.form = new Form(target, {
        validate: true
    });

    this.tooltip = new Alert(tooltipTemplate, target);

    // add error message
    this.form.onBlur(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        that.tooltip.hide();
    });

    this.form.onKeyup(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.getByTarget();
            if (tooltip) tooltip.html(info);
        }
    });

    this.form.onChange(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.show({text: info});
            if (tooltip) tooltip.css("left", ($el.width() - tooltip.width()) / 2 + "px");
        } else {
            that.tooltip.hide();
        }
    });

    this.form.onFocus(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.show({text: info});
            if (tooltip) tooltip.css("left", ($el.width() - tooltip.width()) / 2 + "px");
        }
    });

    this.form.onValidateError(function (el) {
        scrollTo($(el).prev("label"));
    });
};

module.exports = BetterForm;

},{"../templates/tooltip.hbs":31,"./alert":1,"./form":7,"./scroll-to":13}],7:[function(require,module,exports){
var validator = require("./validator");
var Listener = require("./listener");

var timer = null;
var validationList = [
    '[type=text]',
    '[type=email]',
    '[type=number]',
    '[type=url]',
    '[type=email]',
    '[type=password]',
    '[data-input-group]',
    'textarea',
    'select'
];

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

// Form.js
var Form = function (target, options) {

    // Options
    this.opts = $.extend({
        validate: false
    }, options || {});

    // Objects
    this.self = to$(target);                   // the form
    this.$inputs = this.self.find(":input");   // all inputs
    this.$submit = this.self.find(":submit");  // submit button
    if (this.opts.validate === true) {
        this.$fields = this.self.find(validationList.join(","));  // all fields need validation
    }

    // Status
    this.allowSubmit = true;

    // Actions
    this.inputFocusAction = null;
    this.inputBlurAction = null;
    this.inputChangeAction = null;
    this.keyupAction = null;
    this.submitAction = null;
    this.validateErrorAction = null;

    // set Listener
    this.listeners = new Listener("form");
    this.setListeners();
};

Form.prototype.addSubmitListener = function () {
    var that = this;

    this.listeners.add(this.self, "submit", function (e) {
        e.preventDefault();
        var invalidElement = null;

        // if allow submit
        if (that.allowSubmit === true) {

            // validate
            if (that.opts.validate === true) {
                that.$fields.each(function () {
                    var errorMessage = that.validateForm(this);
                    if (errorMessage && !invalidElement) invalidElement = this;
                });
            }

            // test whether to submit
            if (invalidElement) {
                if (that.validateErrorAction) that.validateErrorAction(invalidElement);
            } else {
                that.disableSubmit();
                if (that.submitAction) that.submitAction(that.getFormUrl(), that.getPostData());
            }
        }
    });

    return this;
};

Form.prototype.addInputListener = function () {
    var that = this;

    // on Focus
    this.listeners.add(this.$inputs, "focus", function (e) {
        if (that.inputFocusAction) that.inputFocusAction(e, this);
    });

    // on Blur
    this.listeners.add(this.$inputs, "blur", function (e) {
        if (that.inputBlurAction) that.inputBlurAction(e, this);
    });

    // on Change
    this.listeners.add(this.$inputs, "change", function (e) {
        // get context ($target[0])
        var $target = $(e.target);
        if ($target.is(":checkbox, :radio")) $target = $target.closest("[data-input-group]");

        // validate form
        if (that.opts.validate === true) that.validateForm($target);

        // custom action
        if (that.inputChangeAction) that.inputChangeAction(e, $target[0]);
    });

    // on Keyup
    this.listeners.add(this.$inputs, "keyup", function (e) {
        if (that.keyupAction) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                // get context ($target[0])
                var $target = $(e.target);
                if ($target.is(":checkbox, :radio")) $target = $target.closest("[data-input-group]");

                // validate
                if (that.opts.validate === true) that.validateForm($target);

                // custom action
                that.keyupAction(e, $target[0]);
            }, 500);
        }
    });

    // fix number input problem
    this.listeners.add(this.$inputs.filter("[type=number]"), "keypress", function (e) {
        if (e.which < 48 || e.which > 57) e.preventDefault();
    });

    return this;
};

Form.prototype.setListeners = function () {
    this.addSubmitListener().addInputListener();
    this.listeners.on();
    return this;
};

Form.prototype.resetListeners = function () {
    this.listeners.remove();
    return this;
};

// return error if invalid
Form.prototype.validateForm = function (input) {
    var $input = to$(input);
    var errorMessage = validator.check($input);

    // adding class and data
    $input.data("validation-error", errorMessage);
    if (errorMessage) {
        $input.addClass("invalid-field");
    } else {
        if ($input.is(".invalid-field")) $input.removeClass("invalid-field");
    }

    return errorMessage;
};

Form.prototype.buttonText = function (text) {
    if (this.$submit.is("button")) {
        this.$submit.text(text);
    } else {
        this.$submit.val(text);
    }
};

Form.prototype.enableSubmit = function () {
    this.$submit.prop("disabled", false);
    this.allowSubmit = true;
    // reset the form
    this.self[0].reset();
    return this;
};

Form.prototype.disableSubmit = function () {
    this.$submit.prop("disabled", true);
    this.allowSubmit = false;
    return this;
};

// Functions
Form.prototype.onFocus = function (func) {
    if ($.isFunction(func)) this.inputFocusAction = func;
    return this;
};

Form.prototype.onBlur = function (func) {
    if ($.isFunction(func)) this.inputBlurAction = func;
    return this;
};

Form.prototype.onChange = function (func) {
    if ($.isFunction(func)) this.inputChangeAction = func;
    return this;
};

Form.prototype.onKeyup = function (func) {
    if ($.isFunction(func)) this.keyupAction = func;
    return this;
};

Form.prototype.onSubmit = function (func) {
    if ($.isFunction(func)) this.submitAction = func;
    return this;
};

Form.prototype.onValidateError = function (func) {
    if ($.isFunction(func)) this.validateErrorAction = func;
    return this;
};

Form.prototype.getData = function () {
    var serializeArray = this.self.serializeArray();
    var output = {};
    $.each(serializeArray, function (key, item) {
        var l = item.name.length;
        if (item.name.indexOf("[]", l - 2) !== -1) {
            var name = item.name.substring(0, l - 2);
            if (!output[name]) output[name] = [];
            output[name].push(item.value);
        } else {
            output[item.name] = item.value;
        }
    });
    return output;
};

Form.prototype.getPostData = function () {
    return this.self.serialize();
};

Form.prototype.getFormUrl = function () {
    return this.self.attr("action");
};

Form.prototype.submit = function () {
    this.self[0].submit();
    return this;
};

module.exports = Form;

},{"./listener":10,"./validator":17}],8:[function(require,module,exports){
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function r4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function within(target, element) {
    element = to$(element);
    return (element.is(target) || element.has(target).length);
}

function isSupport(property) {
    return property in document.body.style;
}

module.exports = {
    to$: to$,
    r4: r4,
    within: within,
    isSupport: isSupport
};

},{}],9:[function(require,module,exports){
// Insert.js 唯一用到的场合，是当一系列 DOM 元素需要频繁添加或删除的时候

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target, insertMethod) {
    this.$target = to$(target);                   // target to insert
    this.template = template;                     // template file
    this.insertMethod = insertMethod || "append"; // insert method
    this.$elements = [];                          // inserted elements

    // Actions
    this.insertAction = null;
    this.destroyAction = null;
};

Insert.prototype.insert = function (data) {
    data = data || {};
    var $element = $(this.template(data));

    // add to DOM
    this.$target[this.insertMethod]($element);

    // add to Array
    var index = this.$elements.indexOf(null);
    if (index > -1) {
        this.$elements[index] = $element;
    } else {
        index = this.$elements.push($element) - 1;
    }

    // custom action
    if (this.insertAction) this.insertAction($element);
    return index;
};

Insert.prototype.destroy = function (index) {
    var length = this.$elements.length;

    if (length > 0) {
        var $element = null;

        if ($.isNumeric(index) && index < length - 1) {
            $element = this.$elements[index];
            if ($element) this.$elements[index] = null;
        } else {
            $element = this.$elements.pop();
        }

        if ($element) {
            if (this.destroyAction) this.destroyAction($element);
            $element.remove();
            return true;
        } else {
            return false;
        }
    }
    return false;
};

Insert.prototype.destroyAll = function () {
    var length = this.$elements.length;

    if (length > 0) {

        length = 0;

        // custom action
        if (this.destroyAction) this.destroyAction(this.$elements);

        // remove all
        $.each(this.$elements, function (index, $element) {
            if ($element) {
                $element.remove();
                length += 1;
            }
        });

        // clear array
        this.$elements = [];
    }

    return length;
};

Insert.prototype.reinsert = function (data, id) {
    this.destroy(id);
    return this.insert(data);
};

Insert.prototype.changeTarget = function (target) {
    this.$target = to$(target); // target to insert
    return this;
};

Insert.prototype.changeTemplate = function (template) {
    this.template = template;
    return this;
};

Insert.prototype.changeMethod = function (method) {
    if (typeof method === "string") this.insertMethod = method;
    return this;
};

Insert.prototype.onInsert = function (func) {
    if ($.isFunction(func)) this.insertAction = func;
    return this;
};

Insert.prototype.onDestroy = function (func) {
    if ($.isFunction(func)) this.destroyAction = func;
    return this;
};

module.exports = Insert;

},{}],10:[function(require,module,exports){
// 注明：只有在需要频繁开启和关闭 listeners 的时候才需要这个库
// 否则直接使用 jQuery 的 on 即可

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Listener = function (namespace, parent) {
    this.parent = (parent) ? to$(parent) : null;
    this.namespace = (namespace) ? "." + namespace : "";
    this.listeners = [];
};

// 1: target, event, func
// 2: event, func
Listener.prototype.add = function () {
    var target, event, func;

    switch (arguments.length) {
        case 2:
            if (!this.parent) throw "no target element for listener!";
            target = this.parent;
            event = arguments[0] + this.namespace;
            func = arguments[1];
            break;
        case 3:
            if (this.parent) {
                target = this.parent.find(arguments[0]);
            } else {
                target = to$(arguments[0]);
            }
            event = arguments[1] + this.namespace;
            func = arguments[2];
            break;
    }

    if (target.length > 0) {
        var listener = {target: target, event: event, execute: func};
        this.listeners.push(listener);
    }
    return this;
};

Listener.prototype.on = function () {
    $.each(this.listeners, function (index, item) {
        item.target.on(item.event, function (e) {
            item.execute.call(this, e);
        });
    });
    return this;
};

Listener.prototype.off = function () {
    $.each(this.listeners, function (index, item) {
        item.target.off(item.event);
    });
    return this;
};

Listener.prototype.remove = function () {
    this.off().listeners = [];
    return this;
};

module.exports = Listener;

},{}],11:[function(require,module,exports){
var box = require("./box"),
    dom = require("./dom"),
    scrollbar = require("./scrollbar");

var target = $(document.body), id,
    el = '<figure class="overlay"></figure>';

module.exports.on = function () {
    id = dom.append(el, target, function ($el) {
        box.transform($el, {
            openClass: "overlay--open",
            closeClass: "overlay--close",
            beforeOpen: function () {
                scrollbar.setPadding();
            },
            afterClose: function () {
                scrollbar.resetPadding();
                dom.remove(id);
            }
        });
        $el.trigger("open");
    });
};

module.exports.off = function () {
    dom.element(id).trigger("close");
};

},{"./box":3,"./dom":4,"./scrollbar":14}],12:[function(require,module,exports){
require("../node_modules/jquery-mousewheel/jquery.mousewheel.js")($);
var h = require("./helper");

var PreventScroll = function ($target) {
    $target = h.to$($target);
    $target.on("mousewheel.preventScroll", function (e) {
        e.stopPropagation();
        if (($target.scrollTop() >= $target[0].scrollHeight - $target.outerHeight() && e.deltaY < 0) ||
            ($target.scrollTop() <= 0 && e.deltaY > 0)) {
            e.preventDefault();
        }
    });
};

module.exports = PreventScroll;

},{"../node_modules/jquery-mousewheel/jquery.mousewheel.js":26,"./helper":8}],13:[function(require,module,exports){
var h = require("./helper.js");

var scrollTo = function (target, options) {
    target = h.to$(target);
    options = options || {};

    if (options["container"]) {
        var container = h.to$(options["container"]);
        container.stop().animate({
            scrollTop: target.offset().top - container.offset().top + container.scrollTop()
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"](target[0]);
        });
    } else {
        $(document.body).stop().animate({
            scrollTop: target.offset().top
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"](target[0]);
        });
    }
};

module.exports = scrollTo;

},{"./helper.js":8}],14:[function(require,module,exports){
var getScrollbarWidth = function () {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

var $body = $(document.body);
var scrollbarWidth = getScrollbarWidth();
var bodyPad = parseInt(($body.css('padding-right') || 0), 10);

// default style
var originalBodyPad = document.body.style.paddingRight || "";
var originalBodyOverflow = document.body.style.overflow || "";

var setPadding = function () {
    if (document.body.clientWidth < window.innerWidth) {
        $body.css('padding-right', bodyPad + scrollbarWidth);
    }
    $body.css("overflow", "hidden");
};

var resetPadding = function () {
    $body.css({
        "padding-right": originalBodyPad,
        "overflow": originalBodyOverflow
    });
};

module.exports = {
    setPadding: setPadding,
    resetPadding: resetPadding
};

},{}],15:[function(require,module,exports){
var h = require("./helper"),
    anim = require("./anim");

///////////// Helper /////////////
function toObject(slides) {
    var output = [];

    switch ($.type(slides)) {
        case "string":
            output = $(slides);
            break;
        case "object":
            if (slides instanceof jQuery) output = slides;
            break;
        case "array":
            $.each(slides, function (id, item) {
                output = output.concat($(item).toArray());
            });
    }

    output = h.to$(output);
    if (output.length === 0) throw "invalid slides!";
    return output;
}

function getWidth(element) {
    return element.outerWidth();
}

////////////// Main //////////////
module.exports.transform = function (container, slides, options) {
    if (!container) throw "invalid slider container!";

    var $stage = h.to$(container),     // visible area
        $slides = toObject(slides),    // all slides
        $clones = $slides.clone(true); // all clones

    // options
    var opts = $.extend({
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1                     // number of slides to show
    }, options);

    // values
    var currId = 0;
    var numSlides = $clones.length;
    var running = false; // whether transition is running

    // Setup slider
    $stage.append($clones);

    // set listeners
    $stage.on("nextSlides", function () {
        if (running === false) {
            running = true;

            var nextId = currId + 1 >= numSlides ? 0 : currId + 1,
                nextSlide = $clones.eq(nextId),
                currSlide = $clones.eq(currId),
                width = getWidth(nextSlide);

            // prepare
            nextSlide.css("right", width * -1).addClass("ready anim");
            currSlide.addClass("anim");

            // move
            currSlide.css(anim.transform, "translateX(-" + width + "px)");
            nextSlide.css(anim.transform, "translateX(-" + width + "px)");
            currId = nextId;

            // after transition finish
            anim.finish(nextSlide, function () {
                nextSlide.addClass("active").removeClass("ready anim");
                currSlide.removeClass("active anim").css(anim.transform, "");
                nextSlide.css("right", "").css(anim.transform, "");
                running = false;
            });
        }
    });

    $stage.on("prevSlides", function () {
        if (running === false) {
            running = true;

            var prevId = currId === 0 ? numSlides - 1 : currId - 1,
                prevSlide = $clones.eq(prevId),
                currSlide = $clones.eq(currId),
                width = getWidth(prevSlide);

            // prepare
            prevSlide.css("left", width * -1).addClass("ready anim");
            currSlide.addClass("anim");

            // move
            currSlide.css(anim.transform, "translateX(" + width + "px)");
            prevSlide.css(anim.transform, "translateX(" + width + "px)");
            currId = prevId;

            // after transition finish
            anim.finish(prevSlide, function () {
                prevSlide.addClass("active").removeClass("ready anim");
                currSlide.removeClass("active anim").css(anim.transform, "");
                prevSlide.css("left", "").css(anim.transform, "");
                running = false;
            });
        }
    });
};

},{"./anim":2,"./helper":8}],16:[function(require,module,exports){
var box = require("./box"),
    dom = require("./dom"),
    h = require("./helper"),
    template = function (msg) {
        return '<div class="tooltip">' + msg + '&nbsp;<span data-box-close>&times;</span></div>';
    };

var show = function (msg, target) {
    var tooltip = $(template(msg));
    if (target) target = h.to$(target);

    if (target.is("[data-tooltip]") && !dom.element(target.data("tooltip-id"))) {
        var id = dom.append(tooltip, target, function ($el) {
            box.transform($el, {
                openClass: "tooltip--open",
                closeClass: "tooltip--close",
                afterClose: function (info) {
                    if (info.tid) return dom.remove(info.tid);
                    if (info.box) return dom.remove(info.box);
                }
            });
            $el.trigger("open");
        });
        target.data("tooltip-id", id);
        return true;
    }
    return false;
};

var remove = function (target) {
    if (!target) throw "remove tooltip: target missing!";
    target = h.to$(target);

    if (target.is("[data-tooltip]")) {
        var id = target.data("tooltip-id");
        target.data("tooltip-id", "");
        if (id && dom.element(id)) {
            dom.element(id).trigger("close", {tid: id});
        }
    }
};

var toggle = function (msg, target) {
    if (!show(msg, target)) remove(target);
};

module.exports = {show: show, remove: remove, toggle: toggle};

},{"./box":3,"./dom":4,"./helper":8}],17:[function(require,module,exports){
// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

//// Input check //////

var checkInput = function ($input) {
    var content = $input.val().trim(),
        type = $input.prop("type"),
        errorMessage;

    if ($input.prop("required")) {
        errorMessage = checkInputRequire($input, content);
        if (errorMessage) return errorMessage;
    }

    if (content && type in checkers) {
        errorMessage = checkers[type]($input, content);
        if (errorMessage) return errorMessage;
    }

    return "";
};

// input type check
var checkers = {
    email: function ($input, content) {
        // Validate Email http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        var re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
        var result = re.test(content);
        if (!result) return "您的邮箱格式不正确";
        return null;
    }
};

// Check required field
var checkInputRequire = function ($input, content) {
    if (content.length > 0) return null;
    return "required";
};


//////// Group check ///////

var checkGroup = function ($field) {
    var checked = null,
        min, max;

    if ($field.data("required") === true) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked === 0) return "required";
    }
    if (min = $field.data("min-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked < min) return "您的选择不得小于" + min + "个";
    }
    if (max = $field.data("max-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked > max) return "您的选择不得大于" + max + "个";
    }

    return "";
};

var Validator = {};

Validator.check = function (field) {
    var $field = to$(field);

    if ($field.is("[data-input-group]")) {
        return checkGroup($field);
    } else {
        return checkInput($field);
    }
};

module.exports = Validator;

},{}],18:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;

var _import = require('./handlebars/base');

var base = _interopRequireWildcard(_import);

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)

var _SafeString = require('./handlebars/safe-string');

var _SafeString2 = _interopRequireWildcard(_SafeString);

var _Exception = require('./handlebars/exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _import2 = require('./handlebars/utils');

var Utils = _interopRequireWildcard(_import2);

var _import3 = require('./handlebars/runtime');

var runtime = _interopRequireWildcard(_import3);

var _noConflict = require('./handlebars/no-conflict');

var _noConflict2 = _interopRequireWildcard(_noConflict);

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
function create() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = _SafeString2['default'];
  hb.Exception = _Exception2['default'];
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;

  hb.VM = runtime;
  hb.template = function (spec) {
    return runtime.template(spec, hb);
  };

  return hb;
}

var inst = create();
inst.create = create;

_noConflict2['default'](inst);

inst['default'] = inst;

exports['default'] = inst;
module.exports = exports['default'];
},{"./handlebars/base":19,"./handlebars/exception":20,"./handlebars/no-conflict":21,"./handlebars/runtime":22,"./handlebars/safe-string":23,"./handlebars/utils":24}],19:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.HandlebarsEnvironment = HandlebarsEnvironment;
exports.createFrame = createFrame;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var VERSION = '3.0.1';
exports.VERSION = VERSION;
var COMPILER_REVISION = 6;

exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '== 1.x.x',
  5: '== 2.0.0-alpha.x',
  6: '>= 2.0.0-beta.1'
};

exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function registerHelper(name, fn) {
    if (toString.call(name) === objectType) {
      if (fn) {
        throw new _Exception2['default']('Arg not supported with multiple helpers');
      }
      Utils.extend(this.helpers, name);
    } else {
      this.helpers[name] = fn;
    }
  },
  unregisterHelper: function unregisterHelper(name) {
    delete this.helpers[name];
  },

  registerPartial: function registerPartial(name, partial) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials, name);
    } else {
      if (typeof partial === 'undefined') {
        throw new _Exception2['default']('Attempting to register a partial as undefined');
      }
      this.partials[name] = partial;
    }
  },
  unregisterPartial: function unregisterPartial(name) {
    delete this.partials[name];
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function () {
    if (arguments.length === 1) {
      // A missing field in a {{foo}} constuct.
      return undefined;
    } else {
      // Someone is actually trying to call something, blow up.
      throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
    }
  });

  instance.registerHelper('blockHelperMissing', function (context, options) {
    var inverse = options.inverse,
        fn = options.fn;

    if (context === true) {
      return fn(this);
    } else if (context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if (context.length > 0) {
        if (options.ids) {
          options.ids = [options.name];
        }

        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
        options = { data: data };
      }

      return fn(context, options);
    }
  });

  instance.registerHelper('each', function (context, options) {
    if (!options) {
      throw new _Exception2['default']('Must pass iterator to #each');
    }

    var fn = options.fn,
        inverse = options.inverse,
        i = 0,
        ret = '',
        data = undefined,
        contextPath = undefined;

    if (options.data && options.ids) {
      contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
    }

    if (isFunction(context)) {
      context = context.call(this);
    }

    if (options.data) {
      data = createFrame(options.data);
    }

    function execIteration(field, index, last) {
      if (data) {
        data.key = field;
        data.index = index;
        data.first = index === 0;
        data.last = !!last;

        if (contextPath) {
          data.contextPath = contextPath + field;
        }
      }

      ret = ret + fn(context[field], {
        data: data,
        blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
      });
    }

    if (context && typeof context === 'object') {
      if (isArray(context)) {
        for (var j = context.length; i < j; i++) {
          execIteration(i, i, i === context.length - 1);
        }
      } else {
        var priorKey = undefined;

        for (var key in context) {
          if (context.hasOwnProperty(key)) {
            // We're running the iterations one step out of sync so we can detect
            // the last iteration without have to scan the object twice and create
            // an itermediate keys array.
            if (priorKey) {
              execIteration(priorKey, i - 1);
            }
            priorKey = key;
            i++;
          }
        }
        if (priorKey) {
          execIteration(priorKey, i - 1, true);
        }
      }
    }

    if (i === 0) {
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function (conditional, options) {
    if (isFunction(conditional)) {
      conditional = conditional.call(this);
    }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function (conditional, options) {
    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
  });

  instance.registerHelper('with', function (context, options) {
    if (isFunction(context)) {
      context = context.call(this);
    }

    var fn = options.fn;

    if (!Utils.isEmpty(context)) {
      if (options.data && options.ids) {
        var data = createFrame(options.data);
        data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
        options = { data: data };
      }

      return fn(context, options);
    } else {
      return options.inverse(this);
    }
  });

  instance.registerHelper('log', function (message, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, message);
  });

  instance.registerHelper('lookup', function (obj, field) {
    return obj && obj[field];
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 1,

  // Can be overridden in the host environment
  log: function log(level, message) {
    if (typeof console !== 'undefined' && logger.level <= level) {
      var method = logger.methodMap[level];
      (console[method] || console.log).call(console, message); // eslint-disable-line no-console
    }
  }
};

exports.logger = logger;
var log = logger.log;

exports.log = log;

function createFrame(object) {
  var frame = Utils.extend({}, object);
  frame._parent = object;
  return frame;
}

/* [args, ]options */
},{"./exception":20,"./utils":24}],20:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var loc = node && node.loc,
      line = undefined,
      column = undefined;
  if (loc) {
    line = loc.start.line;
    column = loc.start.column;

    message += ' - ' + line + ':' + column;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }

  if (loc) {
    this.lineNumber = line;
    this.column = column;
  }
}

Exception.prototype = new Error();

exports['default'] = Exception;
module.exports = exports['default'];
},{}],21:[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;
/*global window */

exports['default'] = function (Handlebars) {
  /* istanbul ignore next */
  var root = typeof global !== 'undefined' ? global : window,
      $Handlebars = root.Handlebars;
  /* istanbul ignore next */
  Handlebars.noConflict = function () {
    if (root.Handlebars === Handlebars) {
      root.Handlebars = $Handlebars;
    }
  };
};

module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

exports.__esModule = true;
exports.checkRevision = checkRevision;

// TODO: Remove this line and break up compilePartial

exports.template = template;
exports.wrapProgram = wrapProgram;
exports.resolvePartial = resolvePartial;
exports.invokePartial = invokePartial;
exports.noop = noop;

var _import = require('./utils');

var Utils = _interopRequireWildcard(_import);

var _Exception = require('./exception');

var _Exception2 = _interopRequireWildcard(_Exception);

var _COMPILER_REVISION$REVISION_CHANGES$createFrame = require('./base');

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
          compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
      throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
    }
  }
}

function template(templateSpec, env) {
  /* istanbul ignore next */
  if (!env) {
    throw new _Exception2['default']('No environment passed to template');
  }
  if (!templateSpec || !templateSpec.main) {
    throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  env.VM.checkRevision(templateSpec.compiler);

  function invokePartialWrapper(partial, context, options) {
    if (options.hash) {
      context = Utils.extend({}, context, options.hash);
    }

    partial = env.VM.resolvePartial.call(this, partial, context, options);
    var result = env.VM.invokePartial.call(this, partial, context, options);

    if (result == null && env.compile) {
      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
      result = options.partials[options.name](context, options);
    }
    if (result != null) {
      if (options.indent) {
        var lines = result.split('\n');
        for (var i = 0, l = lines.length; i < l; i++) {
          if (!lines[i] && i + 1 === l) {
            break;
          }

          lines[i] = options.indent + lines[i];
        }
        result = lines.join('\n');
      }
      return result;
    } else {
      throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
    }
  }

  // Just add water
  var container = {
    strict: function strict(obj, name) {
      if (!(name in obj)) {
        throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
      }
      return obj[name];
    },
    lookup: function lookup(depths, name) {
      var len = depths.length;
      for (var i = 0; i < len; i++) {
        if (depths[i] && depths[i][name] != null) {
          return depths[i][name];
        }
      }
    },
    lambda: function lambda(current, context) {
      return typeof current === 'function' ? current.call(context) : current;
    },

    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,

    fn: function fn(i) {
      return templateSpec[i];
    },

    programs: [],
    program: function program(i, data, declaredBlockParams, blockParams, depths) {
      var programWrapper = this.programs[i],
          fn = this.fn(i);
      if (data || depths || blockParams || declaredBlockParams) {
        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
      }
      return programWrapper;
    },

    data: function data(value, depth) {
      while (value && depth--) {
        value = value._parent;
      }
      return value;
    },
    merge: function merge(param, common) {
      var obj = param || common;

      if (param && common && param !== common) {
        obj = Utils.extend({}, common, param);
      }

      return obj;
    },

    noop: env.VM.noop,
    compilerInfo: templateSpec.compiler
  };

  function ret(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var data = options.data;

    ret._setup(options);
    if (!options.partial && templateSpec.useData) {
      data = initData(context, data);
    }
    var depths = undefined,
        blockParams = templateSpec.useBlockParams ? [] : undefined;
    if (templateSpec.useDepths) {
      depths = options.depths ? [context].concat(options.depths) : [context];
    }

    return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
  }
  ret.isTop = true;

  ret._setup = function (options) {
    if (!options.partial) {
      container.helpers = container.merge(options.helpers, env.helpers);

      if (templateSpec.usePartial) {
        container.partials = container.merge(options.partials, env.partials);
      }
    } else {
      container.helpers = options.helpers;
      container.partials = options.partials;
    }
  };

  ret._child = function (i, data, blockParams, depths) {
    if (templateSpec.useBlockParams && !blockParams) {
      throw new _Exception2['default']('must pass block params');
    }
    if (templateSpec.useDepths && !depths) {
      throw new _Exception2['default']('must pass parent depths');
    }

    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
  };
  return ret;
}

function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
  function prog(context) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
  }
  prog.program = i;
  prog.depth = depths ? depths.length : 0;
  prog.blockParams = declaredBlockParams || 0;
  return prog;
}

function resolvePartial(partial, context, options) {
  if (!partial) {
    partial = options.partials[options.name];
  } else if (!partial.call && !options.name) {
    // This is a dynamic partial that returned a string
    options.name = partial;
    partial = options.partials[partial];
  }
  return partial;
}

function invokePartial(partial, context, options) {
  options.partial = true;

  if (partial === undefined) {
    throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
  } else if (partial instanceof Function) {
    return partial(context, options);
  }
}

function noop() {
  return '';
}

function initData(context, data) {
  if (!data || !('root' in data)) {
    data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
    data.root = context;
  }
  return data;
}
},{"./base":19,"./exception":20,"./utils":24}],23:[function(require,module,exports){
'use strict';

exports.__esModule = true;
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
  return '' + this.string;
};

exports['default'] = SafeString;
module.exports = exports['default'];
},{}],24:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.extend = extend;

// Older IE versions do not directly support indexOf so we must implement our own, sadly.
exports.indexOf = indexOf;
exports.escapeExpression = escapeExpression;
exports.isEmpty = isEmpty;
exports.blockParams = blockParams;
exports.appendContextPath = appendContextPath;
var escape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#x27;',
  '`': '&#x60;'
};

var badChars = /[&<>"'`]/g,
    possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr];
}

function extend(obj /* , ...source */) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        obj[key] = arguments[i][key];
      }
    }
  }

  return obj;
}

var toString = Object.prototype.toString;

exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
/*eslint-disable func-style, no-var */
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
/* istanbul ignore next */
if (isFunction(/x/)) {
  exports.isFunction = isFunction = function (value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
/*eslint-enable func-style, no-var */

/* istanbul ignore next */
var isArray = Array.isArray || function (value) {
  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
};exports.isArray = isArray;

function indexOf(array, value) {
  for (var i = 0, len = array.length; i < len; i++) {
    if (array[i] === value) {
      return i;
    }
  }
  return -1;
}

function escapeExpression(string) {
  if (typeof string !== 'string') {
    // don't escape SafeStrings, since they're already safe
    if (string && string.toHTML) {
      return string.toHTML();
    } else if (string == null) {
      return '';
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = '' + string;
  }

  if (!possible.test(string)) {
    return string;
  }
  return string.replace(badChars, escapeChar);
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function blockParams(params, ids) {
  params.path = ids;
  return params;
}

function appendContextPath(contextPath, id) {
  return (contextPath ? contextPath + '.' : '') + id;
}
},{}],25:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime')['default'];

},{"./dist/cjs/handlebars.runtime":18}],26:[function(require,module,exports){
/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

},{}],27:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"alert\">\n    <div class=\"overlay\"></div>\n    <div class=\"inner\">\n        "
    + this.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "\n        <button style=\"padding: 5px 8px; margin-left: 15px\" data-type=\"close\">Close</button>\n        <button style=\"padding: 5px 8px; margin-left: 15px\" data-type=\"alert\">Yes</button>\n    </div>\n</div>\n";
},"useData":true});
},{"handlebars/runtime":25}],28:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"dropdown\">\n    <div style=\"height: 50px;\">\n        "
    + this.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "<br>\n        <button data-type=\"alert\" style=\"padding: 0;\">Yes</button>\n    </div>\n    <div style=\"height: 100px;overflow: hidden;margin-bottom: 10px\">\n        <div style=\"overflow: auto; height: 100px\" class=\"scroll1\">\n            <div style=\"height: 500px;background: blue\"></div>\n        </div>\n    </div>\n    <div style=\"height: 100px;overflow: hidden\">\n        <div style=\"overflow: auto; height: 100px\" class=\"scroll2\">\n            <div style=\"height: 500px;background: green\"></div>\n        </div>\n    </div>\n</div>\n";
},"useData":true});
},{"handlebars/runtime":25}],29:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div style=\"padding: 50px;\" class=\"modal\">\n    "
    + this.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "<br>\n    <button data-type=\"alert\">Yes</button>\n</div>\n";
},"useData":true});
},{"handlebars/runtime":25}],30:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div>"
    + this.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"useData":true});
},{"handlebars/runtime":25}],31:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"tooltip\">"
    + ((stack1 = ((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>";
},"useData":true});
},{"handlebars/runtime":25}],32:[function(require,module,exports){
var FloatBox = require("../../js/float-box");
var Form = require("../../js/form-with-validation");
var Insert = require("../../js/insert");
var Alert = require("../../js/alert");
var Listener = require("../../js/listener");
var Scroll = require("../../js/scroll-to");

// templates
var dropdownHBS = require("../../templates/dropdown.hbs");
var modalHBS = require("../../templates/modal.hbs");
var alertHBS = require("../../templates/alert.hbs");
var textHBS = require("../../templates/text.hbs");
var alert1HBS = require("../templates/alert1.hbs");
var alert2HBS = require("../templates/alert2.hbs");
var alert3HBS = require("../templates/alert3.hbs");
var tooltipHBS = require("../../templates/tooltip.hbs");
var mapCanvasHBS = require("../templates/map.hbs");

// float-box.js //
var $floatBox = $(".float-box");
if ($floatBox.length) {
    var $target = $(".target"); // to show elements
    var showcase = new Insert(dropdownHBS, $target);
    var $button = $floatBox.find("button");
    var fbox, options;
    showcase.onInsert(function ($el) {
        fbox = new FloatBox($el, options);
        fbox.addCloseButton("button[data-type=close]");
        fbox.addListener("button[data-type=alert]", "click", function () {
            alert("yes");
        });
        $button.on("click", function () {
            fbox.toggle();
        });
    });
    showcase.onDestroy(function () {
        $button.off("click");
    });

    var $select = $floatBox.find("#float-box-opts");
    $select.change(function () {
        switch ($select.val()) {
            case "dropdown":
                options = {
                    preventScroll: [".scroll1", ".scroll2"],
                    closeOnScroll: true
                };
                showcase.changeTemplate(dropdownHBS);
                showcase.reinsert({text: "this is a Dropdown"});
                break;
            case "modal":
                options = {
                    hasOverlay: true,
                    closeOnClick: true
                };
                showcase.changeTemplate(modalHBS);
                showcase.reinsert({text: "this is a Modal"});
                break;
            case "alert":
                options = {};
                showcase.changeTemplate(alertHBS);
                showcase.reinsert({text: "这是一个警告！"});
                break;
            case "dynamicAlert":
                var alert = new Alert(alertHBS);
                alert.show({text: "this is a dynamic alert!"});
                break;
            case "tooltips":
                var tooltip = new Alert(tooltipHBS);
                tooltip.changeTarget(".target");
                tooltip.onShow(function ($el) {
                    $el.addClass("reverse");
                });
                tooltip.show({text: "this is a tooltip"});
                break;
            default:
                options = {};
                showcase.destroy();
                break
        }
    });
}

// BetterForm.js //
var $userForm = $("#usrForm");
if ($userForm.length) {
    var map;
    var geocoder = new google.maps.Geocoder();
    var mapCanvas = new Insert(mapCanvasHBS, "#location", "after");
    mapCanvas.onInsert(function ($el) {
        var latlng = new google.maps.LatLng(-34.397, 150.644);
        var mapOptions = {
            zoom: 8,
            center: latlng,
            disableDefaultUI: true
        };
        map = new google.maps.Map($el.children().get(0), mapOptions);
    });

    var form = new Form($userForm);
    var $location = form.self.find("#location");
    $location.on("blur", function () {
        var address = $(this).val();

        if (!$.isNumeric($(this).data("map-id"))) {
            $(this).data("map-id", mapCanvas.insert());
        }

        //geocoder.geocode({'address': address}, function (result, status) {
        //    if (status == google.maps.GeocoderStatus.OK) {
        //
        //    } else {
        //        console.log(status);
        //    }
        //});
    });
}

// insert.js //
var $insert = $("#insert-test");
if ($insert.length) {

    var insertButton1 = $insert.find("button.insert1");
    var insertButton2 = $insert.find("button.insert2");
    var insertButton3 = $insert.find("button.insert3");

    var deleteButton = $insert.find("button.delete");
    var deleteAllButton = $insert.find("button.delete-all");
    var insertTarget = $insert.find(".insert-target");
    var insertion = new Insert(textHBS, insertTarget);

    insertButton1.click(function () {
        insertion.changeTemplate(alert1HBS);
        insertion.onInsert(function ($el) {
            $el.data("listener", new Listener("insert", $el));
            $el.data("listener").add("button", "click", function () {
                alert("this is button 1 by Listener");
            }).on();
        });
        insertion.insert();
    });
    insertButton2.click(function () {
        insertion.changeTemplate(alert2HBS);
        insertion.onInsert(function ($el) {
            var listener = new Listener("insert", $el);
            listener.add("button", "click", function () {
                alert("this is button 2 by Listener");
            }).on();
        });
        insertion.insert();
    });
    insertButton3.click(function () {
        insertion.changeTemplate(alert3HBS);
        insertion.onInsert(function ($el) {
            var listener = new Listener("insert", $el);
            listener.add("button", "click", function () {
                alert("this is button 3 by Listener");
            }).on();
        });
        insertion.insert();
    });
    deleteButton.click(function () {
        insertion.destroy();
    });
    deleteAllButton.click(function () {
        insertion.destroyAll();
    });
    insertion.onDestroy(function (el) {
        console.log(el);
    });
}

// scroll-to.js //
var $scrollTo = $(".scroll");
if ($scrollTo.length > 0) {
    $("button").click(function () {
        Scroll(".target", {
            container: ".inner"
        });
    });
}

// box.js //
var $box = $(".box");
if ($box.length) {
    //var box = require("../../js/box");
    //var theBox = $("#box");
    //var info = {
    //    beforeClose: "This is before Close",
    //    afterClose: "This is after Close",
    //    beforeOpen: "This is before Open",
    //    afterOpen: "This is after Open"
    //};
    //box.transform(theBox, {
    //    //closeOnScroll: true,
    //    beforeClose: function (info) {
    //        console.log(info.beforeClose);
    //    },
    //    afterClose: function (info) {
    //        console.log(info.afterClose);
    //    },
    //    beforeOpen: function (info) {
    //        console.log(info.beforeOpen);
    //    },
    //    afterOpen: function (info) {
    //        console.log(info.afterOpen);
    //    }
    //});

    var tooltip = require("../../js/tooltip");
    var dom = require("../../js/dom");

    $("#1").on("click", function (event) {
        tooltip.toggle(event.target.innerHTML, event.target);
        //theBox.trigger("open", info);
    });
    $("#2").on("click", function (event) {
        tooltip.toggle(event.target.innerHTML, event.target);
        //theBox.trigger("toggle", info);
    });
    $("#3").on("click", function (event) {
        tooltip.toggle(event.target.innerHTML, event.target);
        //theBox.trigger("close", info);
    });
    $("#4").on("click", function () {
        console.log(dom.element("all"));
    });
}

// slider.js //
var $slider = $("#slider");
if ($slider.length) {
    var slider = require("../../js/slider");
    slider.transform($slider, ".slide");
    $("#next").click(function () {
        $slider.trigger("nextSlides");
    });
    $("#prev").click(function () {
        $slider.trigger("prevSlides");
    });
}

},{"../../js/alert":1,"../../js/dom":4,"../../js/float-box":5,"../../js/form-with-validation":6,"../../js/insert":9,"../../js/listener":10,"../../js/scroll-to":13,"../../js/slider":15,"../../js/tooltip":16,"../../templates/alert.hbs":27,"../../templates/dropdown.hbs":28,"../../templates/modal.hbs":29,"../../templates/text.hbs":30,"../../templates/tooltip.hbs":31,"../templates/alert1.hbs":33,"../templates/alert2.hbs":34,"../templates/alert3.hbs":35,"../templates/map.hbs":36}],33:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div>\n    <button data-msg=\"alert1\">alert1</button>\n</div>\n";
},"useData":true});
},{"handlebars/runtime":25}],34:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div>\n    <button data-msg=\"alert2\">alert2</button>\n</div>";
},"useData":true});
},{"handlebars/runtime":25}],35:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div>\n    <button data-msg=\"alert3\">alert3</button>\n</div>";
},"useData":true});
},{"handlebars/runtime":25}],36:[function(require,module,exports){
var templater = require("handlebars/runtime")["default"].template;module.exports = templater({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"googleMap\">\n    <div id=\"map-canvas\" style=\"height: 200px\"></div>\n</div>\n";
},"useData":true});
},{"handlebars/runtime":25}]},{},[32]);
