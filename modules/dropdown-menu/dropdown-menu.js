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
        closeOnScroll: false,   // Close menu on page scrolling
        closeOnClick: true,     // Close menu on clicking outside of the menu
        closeOnLeave: false,    // Close menu on mouse left menu area
        closeOnSelect: true,    // Close menu when an item is selected
        multiSelection: false,  // Select multiple items
        preventClose: [],       // Prevent menu close when clicking these elements
        preventScroll: null,    // Elements that need background scroll prevention
        highlightResult: false,  // highlight matched string
        $noResult: $("<li>", {html: "没有结果了"}) // create a row show no result using jQuery
    }, options);

    // "preventClose" array
    if (options.preventClose && options.preventClose.constructor !== Array) {
        this.opts.preventClose = [this.$menu, this.opts.preventClose];
    } else {
        this.opts.preventClose.unshift(this.$menu);
    }

    // Custom actions
    this.menuOpenAction = null;
    this.menuCloseAction = null;
    this.itemSelectAction = null; // run after item(s) has been selected
    this.itemFilterAction = null; // run after items have been filtered

    // Set Listeners
    this.setMenuListener(this);
    this.setItemListener(this);

    // prevent scroll
    if (!this.opts.preventScroll) this.opts.preventScroll = this.$menu.find("ul");
    preventScroll(this.opts.preventScroll);
};

DropdownMenu.prototype.setMenuListener = function (context) {
    var self = context || this;

    self.$menu.on("dropdown:open", function (event) {
        if ($(this).is(":hidden")) {
            $(this).show();
            if (self.menuOpenAction) self.menuOpenAction(event);
        }
    }).on("dropdown:close", function (event) {
        if ($(this).is(":visible")) {
            $(this).hide();
            if (self.menuCloseAction) self.menuCloseAction(event);
        }
    }).on("dropdown:toggle", function (event) {
        if ($(this).is(":visible")) {
            $(this).hide();
            if (self.menuCloseAction) self.menuCloseAction(event);
        } else {
            $(this).show();
            if (self.menuOpenAction) self.menuOpenAction(event);
        }
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

    self.$items.on("dropdown:select", function (event) {
        var $this = $(this);
        $this.toggleClass("S");
        if (self.opts.multiSelection === false) {
            $this.siblings(".S").removeClass("S");
        }
        if (self.opts.closeOnSelect === true) {
            self.$menu.trigger("dropdown:close");
        }
        if (self.itemSelectAction) self.itemSelectAction(event);
    });

    self.$items.on("click", function () {
        $(this).trigger("dropdown:select");
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

DropdownMenu.prototype.onMenuOpen = function (func) {
    if ($.isFunction(func)) this.menuOpenAction = func;
    return this;
};

DropdownMenu.prototype.onMenuClose = function (func) {
    if ($.isFunction(func)) this.menuCloseAction = func;
    return this;
};

DropdownMenu.prototype.onItemSelect = function (func) {
    if ($.isFunction(func)) this.itemSelectAction = func;
    return this;
};

DropdownMenu.prototype.onItemFilter = function (func) {
    if ($.isFunction(func)) this.itemFilterAction = func;
    return this;
};

DropdownMenu.prototype.clearAllSelected = function () {
    this.$items.filter(".S").removeClass("S");
    return this;
};

DropdownMenu.prototype.showAll = function () {
    this.$items.filter(".H").removeClass("H");
    return this;
};

DropdownMenu.prototype.updateAll = function () {
    this.$items = null;
    this.$items = this.$menu.find("[data-value]:not(.disabled)");
    if (this.$items.length > 0) this.setItemListener(this);
    return this;
};

DropdownMenu.prototype.getSelectedValues = function (context) {
    var self = context || this;
    var output = [];

    self.$items.filter(".S").each(function () {
        output.push($(this).data("value"));
    });

    if (output.length > 0) return output;
    return null;
};

DropdownMenu.prototype.getAllSelected = function (context) {
    var self = context || this;
    var $output = self.$items.filter(".S");
    if ($output.length > 0) return $output;
    return null;
};

DropdownMenu.prototype.getAllUnselected = function (context) {
    var self = context || this;
    var $output = self.$items.filter(":not(.S)");
    if ($output.length > 0) return $output;
    return null;
};

DropdownMenu.prototype.filter = function (searchString) {
    var regex = "", showed = [], hid = [];

    if (this.opts.highlightResult === true) {
        regex = new RegExp(searchString, "ig"); // "/searchString/ig"
    } else {
        regex = new RegExp(searchString, "i"); // "/searchString/i"
    }

    this.$items.each(function () {
        var $this = $(this);
        var text = $this.text();

        if (regex.test(text)) {
            if ($this.is(".H")) $this.removeClass("H");
            showed.push(this);
        } else {
            if ($this.not(".H")) $this.addClass("H");
            hid.push(this);
        }
    });

    if (showed.length === 0) {
        this.$items.parent().append(this.opts.$noResult);
    } else {
        this.opts.$noResult.remove();
    }

    if (this.itemFilterAction) this.itemFilterAction($(showed), $(hid));
    return this;
};

module.exports = DropdownMenu;
