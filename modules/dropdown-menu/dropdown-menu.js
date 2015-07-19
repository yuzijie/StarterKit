var DropdownMenu = function ($menu, $trigger, options) {
    this.$menu = $menu;
    this.$items = this.$menu.children();
    this.itemAction = null;
    this.$trigger = $trigger;

    this.opts = $.extend({
        triggerOnHover: false, // options: "true" or "false"
        hideElsewhere: true, // options: "true" or "false", click elsewhere to hide the menu
        multiSelection: false // options: "false" or "true"
    }, options);

    this.listenTrigger(this);
    this.listenMenu(this);
};

DropdownMenu.prototype.listenTrigger = function (self) {
    self = self || this;

    if (this.opts.triggerOnHover === true) {
        this.$trigger.on("mouseenter", function () {
            self.$menu.show();
        });
        this.$menu.on("mouseleave", function () {
            self.$menu.hide();
        });
    }
    this.$trigger.on("click", function (e) {
        e.preventDefault();
        self.$menu.toggle();
    });
    if (this.opts.hideElsewhere === true) {
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
        if ($(this).data().hasOwnProperty("value") && !$(this).hasClass("disabled")) {
            $(this).toggleClass("selected");
            if (self.opts.multiSelection === false) {
                $(this).siblings(".selected").removeClass("selected");
            }
        }
        if (self.itemAction) self.itemAction()
    });
};

DropdownMenu.prototype.getValues = function (self) {
    self = self || this;
    var output = [];

    self.$items.filter(".selected").each(function () {
        output.push($(this).data("value"));
    });

    if (output) {
        if (self.opts.multiSelection === false) {
            return output[0];
        } else {
            return output;
        }
    } else {
        return null;
    }
};

DropdownMenu.prototype.onItemClick = function (func) {
    if ($.isFunction(func)) this.itemAction = func
};

module.exports = DropdownMenu;
