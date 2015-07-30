var prevent = require("./prevent-scroll");
var scrollbar = require("./scrollbar");
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

    // Elements that need scroll prevention
    if (options.preventScroll) {
        handle(options.preventScroll, function (item) {
            prevent(that.self.find(item)); // preventScroll
        });
    } else prevent(that.self.children()); // preventScroll

    // Custom actions
    this.boxOpenAction = null;
    this.boxCloseAction = null;
};

FloatBox.prototype.setListener = function () {
    var that = this;

    // Close box when clicking outside of it
    if (that.opts.closeOnClick === true) {
        $(document).on("click.floatBox", function (e) {
            if (that.self.is(e.target) || that.self.has(e.target).length > 0) {
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
};

FloatBox.prototype.resetListener = function () {
    if (this.opts.closeOnClick === true) $(document).off("click.floatBox");
    if (this.opts.closeOnScroll === true) $(window).off("scroll.floatBox");
    if (this.opts.closeOnLeave === true) this.self.off("mouseleave.floatBox");
    return this;
};

FloatBox.prototype.open = function () {
    if (this.self.is(":hidden")) {
        if (this.opts.hasOverlay === true) {
            scrollbar.setPadding();
            $body.addClass("overlay");
        }
        if (this.boxOpenAction) this.boxOpenAction();
        this.self.show();
        this.setListener();
        return true;
    }
    return false;
};

FloatBox.prototype.close = function () {
    if (this.self.is(":visible")) {
        if (this.opts.hasOverlay === true) {
            scrollbar.resetPadding();
            $body.removeClass("overlay");
        }
        this.self.hide();
        if (this.boxCloseAction) this.boxCloseAction();
        this.resetListener();
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

// 把 FloatBox 放在某个元素内
FloatBox.prototype.attachTo = function (target) {
    if (target) {
        target = to$(target);
        target.html(this.self);
    }
    return this;
};

module.exports = FloatBox;
