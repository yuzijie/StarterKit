// Usage:
//
// var dropdown = new DropdownMenu($menu, {options: value});
// var dropdown = new DropdownMenu($menu);
//
// Require:
// prevent-scroll.js
//
var preventScroll = require("../../js/prevent-scroll.js");

var DropdownMenu = function ($menu, options) {
    // Objects
    this.$menu = $menu;
    this.$items = this.$menu.find("[data-value]:not(.disabled)");

    // Options
    this.opts = $.extend({
        closeOnScroll: false,  // Close menu on page scrolling
        closeOnClick: true,    // Close menu on clicking outside of the menu
        closeOnLeave: false,   // Close menu on mouse left menu area
        multiSelection: false, // Select multiple items
        colSelection: true,    // Allow one single selection on each column
        preventClose: [],      // Prevent menu from closing when clicking these elements
        preventScroll: null    // Elements that need background scroll prevention
    }, options);

    // Add this.$menu to prevent close array
    if (this.opts.preventClose.constructor === Array) {
        this.opts.preventClose.unshift(this.$menu);
    } else if (this.opts.preventClose) {
        this.opts.preventClose = [this.$menu, this.opts.preventClose];
    }

    // Custom actions
    this.itemClickAction = null;
    this.menuOpenAction = null;
    this.menuCloseAction = null;
    this.menuToggleAction = null;

    // Set Listeners
    this.setMenuListener(this);
    this.setItemListener(this);

    // prevent scroll
    if (!this.opts.preventScroll) this.opts.preventScroll = this.$menu.find("ul");
    preventScroll(this.opts.preventScroll);
};

DropdownMenu.prototype.setMenuListener = function (context) {
    var self = context || this;

    self.$menu.on("dropdown:open", function () {
        $(this).show();
        if (self.menuOpenAction) self.menuOpenAction();
    }).on("dropdown:close", function () {
        $(this).hide();
        if (self.menuCloseAction) self.menuCloseAction();
    }).on("dropdown:toggle", function () {
        $(this).toggle();
        if (self.menuToggleAction) self.menuToggleAction();
    });

    if (self.opts.closeOnScroll === true) {
        $(window).on("scroll", function () {
            self.$menu.trigger("dropdown:close");
        });
    }

    if (self.opts.closeOnClick === true) {
        $(document).on("click", function (e) {
            var hide = true, i;
            for (i = 0; i < self.opts.preventClose.length; i++) {
                var $element = self.opts.preventClose[i];
                if ($element.is(e.target) || $element.has(e.target).length > 0) hide = false;
            }
            if (hide === true) self.$menu.trigger("dropdown:close");
        });
    }

    if (self.opts.closeOnLeave === true) {
        self.$menu.on("mouseleave", function () {
            self.$menu.trigger("dropdown:close");
        });
    }
};

DropdownMenu.prototype.setItemListener = function (context) {
    var self = context || this;

    self.$items.on("click", function () {
        var $this = $(this);
        $this.toggleClass("selected");

        if (self.opts.multiSelection === false) {
            if (self.opts.multiSingle === true) {
                $this.siblings(".selected").removeClass("selected");
            } else {
                self.$items.filter(".selected").not(this).removeClass("selected");
            }
        }

        if (self.itemClickAction) self.itemClickAction($this);
    });
};

DropdownMenu.prototype.open = function () {
    this.$menu.trigger("dropdown:open");
    return this;
};

DropdownMenu.prototype.close = function () {
    this.$menu.trigger("dropdown:close");
    return this;
};

DropdownMenu.prototype.toggle = function () {
    this.$menu.trigger("dropdown:toggle");
    return this;
};

DropdownMenu.prototype.onItemClick = function (func) {
    if ($.isFunction(func)) this.itemClickAction = func;
    return this;
};

DropdownMenu.prototype.onMenuOpen = function (func) {
    if ($.isFunction(func)) this.menuOpenAction = func;
    return this;
};

DropdownMenu.prototype.onMenuClose = function (func) {
    if ($.isFunction(func)) this.menuCloseAction = func;
    return this;
};

DropdownMenu.prototype.onMenuToggle = function (func) {
    if ($.isFunction(func)) this.menuToggleAction = func;
    return this;
};

DropdownMenu.prototype.clearSelection = function () {
    this.$items.filter(".selected").removeClass("selected");
    return this;
};

DropdownMenu.prototype.updateMenuItems = function () {
    this.$items = null;
    this.$items = this.$menu.find("[data-value]:not(.disabled)");
    if (this.$items.length > 0) this.setItemListener(this);
    return this;
};

DropdownMenu.prototype.getValuesArray = function (context) {
    var self = context || this;
    var output = [];

    self.$items.filter(".selected").each(function () {
        output.push($(this).data("value"));
    });

    if (output) return output;
    return null;
};

module.exports = DropdownMenu;
