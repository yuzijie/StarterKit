var preventScroll = require("./prevent-scroll");

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

var FloatBox = function (box, options) {
    this.self = to$(box);
    var that = this;

    // Options
    options = options || {};
    this.opts = $.extend({
        closeOnScroll: false,  // Close box on page scrolling
        closeOnClick: false,   // Close box when clicking outside of it
        closeOnLeave: false    // Close box after mouse left box area
    }, options);

    // Prevent closing when clicking
    this.preventClose = [this.self];
    if (options.preventClose) {
        handle(options.preventClose, function (item) {
            that.preventClose.push(to$(item));
        });
    }

    // Elements that need scroll prevention
    if (options.preventScroll) {
        handle(options.preventScroll, function (item) {
            preventScroll(that.self.find(item));
        });
    } else preventScroll(that.self.children());

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
            for (i = 0; i < that.preventClose.length; i++) {
                var $element = that.preventClose[i];
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

FloatBox.prototype.attachTo = function (target) {
    if (target) {
        target = to$(target);
        target.html(this.self);
    }
    return this;
};

module.exports = FloatBox;
