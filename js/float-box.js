var preventScroll = require("./prevent-scroll");

var FloatBox = function (box, options) {
    // Object
    this.$box = typeof box === "string" ? $(box) : box;

    // Options
    this.opts = $.extend({
        closeOnScroll: false,                 //   Close box on page scrolling
        closeOnClick: true,                   //   Close box when clicking outside of it
        closeOnLeave: false,                  //   Close box after mouse left box area
        preventClose: [],                     //   Prevent menu close when clicking these elements
        preventScroll: this.$box.children()   //   Elements that need background scroll prevention
    }, options);

    // preventClose Array
    if (options.preventClose && options.preventClose.constructor !== Array) {
        this.opts.preventClose = [this.$box, options.preventClose];
    } else {
        this.opts.preventClose.unshift(this.$box);
    }

    // preventScroll
    if (options.preventScroll && typeof options.preventScroll === "string") {
        this.opts.preventScroll = this.$box.find(options.preventScroll);
    }
    if (this.opts.preventScroll) preventScroll(this.opts.preventScroll);

    // Custom actions
    this.boxOpenAction = null;
    this.boxCloseAction = null;

    // Set Listener
    this.setListener();
};

FloatBox.prototype.setListener = function () {
    var self = this;

    //Close menu on page scrolling
    if (self.opts.closeOnScroll === true) {
        $(window).on("scroll", function () {
            self.close();
        });
    }

    // Close box when clicking outside of it
    if (self.opts.closeOnClick === true) {
        $(document).on("click", function (e) {
            var hide = true, i;
            for (i = 0; i < self.opts.preventClose.length; i++) {
                var $element = self.opts.preventClose[i];
                if ($element.is(e.target) || $element.has(e.target).length > 0) hide = false;
            }
            if (hide === true) self.close();
        });
    }

    // Close box after mouse left the box area
    if (self.opts.closeOnLeave === true) {
        self.$box.on("mouseleave", function () {
            self.close();
        });
    }
};

FloatBox.prototype.open = function () {
    if (this.$box.is(":hidden")) {
        this.$box.show();
        if (this.boxOpenAction) this.boxOpenAction();
        return true;
    } else {
        return false;
    }
};

FloatBox.prototype.close = function () {
    if (this.$box.is(":visible")) {
        this.$box.hide();
        if (this.boxCloseAction) this.boxCloseAction();
        return true;
    } else {
        return false;
    }
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

module.exports = FloatBox;
