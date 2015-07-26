var preventScroll = require("./prevent-scroll");

var FloatBox = function (box, options) {
    // Object
    this.self = (box instanceof jQuery) ? box : $(box);
    options = options || {};

    // Options
    this.opts = $.extend({
        closeOnScroll: false,                 //   Close box on page scrolling
        closeOnClick: false,                  //   Close box when clicking outside of it
        closeOnLeave: false,                  //   Close box after mouse left box area
        preventClose: [],                     //   Prevent menu close when clicking these elements
        preventScroll: this.self.children()   //   Elements that need background scroll prevention
    }, options);

    // preventClose Array
    if (options.preventClose && options.preventClose.constructor !== Array) {
        this.opts.preventClose = [this.self, options.preventClose];
    } else {
        this.opts.preventClose.unshift(this.self);
    }

    // preventScroll
    if (options.preventScroll && typeof options.preventScroll === "string") {
        this.opts.preventScroll = this.self.find(options.preventScroll);
    }
    if (this.opts.preventScroll.length > 0) preventScroll(this.opts.preventScroll);

    // Custom actions
    this.boxOpenAction = null;
    this.boxCloseAction = null;

    // Set Listener
    this.setListener();
};

FloatBox.prototype.setListener = function () {
    var that = this;

    //Close menu on page scrolling
    if (that.opts.closeOnScroll === true) {
        $(window).on("scroll", function () {
            that.close();
        });
    }

    // Close box when clicking outside of it
    if (that.opts.closeOnClick === true) {
        $(document).on("click", function (e) {
            var hide = true, i;
            for (i = 0; i < that.opts.preventClose.length; i++) {
                var $element = that.opts.preventClose[i];
                if ($element.is(e.target) || $element.has(e.target).length > 0) hide = false;
            }
            if (hide === true) that.close();
        });
    }

    // Close box after mouse left the box area
    if (that.opts.closeOnLeave === true) {
        that.self.on("mouseleave", function () {
            that.close();
        });
    }
};

FloatBox.prototype.open = function () {
    if (this.self.is(":hidden")) {
        this.self.show();
        if (this.boxOpenAction) this.boxOpenAction();
        return true;
    }
    return false;
};

FloatBox.prototype.close = function () {
    if (this.self.is(":visible")) {
        this.self.hide();
        if (this.boxCloseAction) this.boxCloseAction();
        return true;
    }
    return false;
};

FloatBox.prototype.toggle = function () {
    if (!this.open()) this.close();
};

FloatBox.prototype.onOpen = function (func) {
    if ($.isFunction(func)) this.boxOpenAction = func;
    return this;
};

FloatBox.prototype.onClose = function (func) {
    if ($.isFunction(func)) this.boxCloseAction = func;
    return this;
};

FloatBox.prototype.attachTo = function (target) {
    if (target) {
        target = (target instanceof jQuery) ? target : $(target);
        target.html(this.self);
    }
};

module.exports = FloatBox;
