var windowScroll = require("../../js/window-scroll.js");

var DropdownMenu = function ($menu, $trigger, options) {
    this.$menu = $menu;
    this.$items = this.$menu.find("[data-value]:not(.disabled)");
    this.$trigger = $trigger;

    this.itemClickAction = null;
    this.leaveMenuAction = null;

    this.opts = $.extend({
        triggerOnHover: false, // options: "true" or "false"
        hideElsewhere: true, // options: "true" or "false", click elsewhere to hide the menu
        multiSelection: false, // options: "false" or "true"
        multiSingle: true // options: "true" or "false", allow one single selection on each column
    }, options);

    this.listenTrigger(this);
    this.listenMenu(this);
};

DropdownMenu.prototype.listenTrigger = function (self) {
    self = self || this;

    // show menu when mouse enter trigger button
    if (this.opts.triggerOnHover === true) {
        this.$trigger.on("mouseenter", function () {
            self.$menu.show();
        });
    }

    // disable window scroll when mouse enter menu
    this.$menu.on("mouseenter", function () {
        windowScroll.disable();
    });

    // enable window scroll when mouse leave menu
    // hide menu and do some custom action
    this.$menu.on("mouseleave", function () {
        windowScroll.enable();
        if (self.opts.triggerOnHover === true) {
            self.$menu.hide();
        }
        if (self.leaveMenuAction) self.leaveMenuAction();
    });

    // click trigger toggle menu
    this.$trigger.on("click", function (e) {
        e.preventDefault();
        self.$menu.toggle();
    });

    if (this.opts.hideElsewhere === true) {
        // window scroll dismiss menu
        $(window).on("scroll", function () {
            self.$menu.hide();
        });

        // click elsewhere dismiss menu
        $(document).on("click", function (e) {
            if (!self.$menu.is(e.target) && !self.$trigger.is(e.target) &&
                self.$menu.has(e.target).length === 0 &&
                self.$trigger.has(e.target).length === 0) {
                self.$menu.hide();
            }
        });
    }
};

DropdownMenu.prototype.listenMenu = function (self) {
    self = self || this;

    self.$items.on("click", function () {
        $(this).toggleClass("selected");
        if (self.opts.multiSelection === false) {
            if (self.opts.multiSingle === true) {
                $(this).siblings(".selected").removeClass("selected");
            } else {
                self.$items.filter(".selected").not(this).removeClass("selected");
            }
        }
        if (self.itemClickAction) self.itemClickAction();
    });
};

DropdownMenu.prototype.getValues = function (self) {
    self = self || this;
    var output = [];

    self.$items.filter(".selected").each(function () {
        output.push($(this).data("value"));
    });

    if (output) return output;
    return null;
};

DropdownMenu.prototype.updateItems = function () {
    this.$items = null;
    this.$items = this.$menu.find("[data-value]:not(.disabled)");
    if (this.$items.length > 0) this.listenMenu();
};

DropdownMenu.prototype.onItemClick = function (func) {
    if ($.isFunction(func)) this.itemClickAction = func;
};

DropdownMenu.prototype.onLeaveMenu = function (func) {
    if ($.isFunction(func)) this.leaveMenuAction = func;
};

DropdownMenu.prototype.clearSelection = function () {
    this.$items.filter(".selected").removeClass("selected");
};

module.exports = DropdownMenu;
