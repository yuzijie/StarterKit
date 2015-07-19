(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Disable scrolling temporarily
// http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily/4770179#4770179

var windowScroll = (function () {
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1};

    function preventDefault(e) { // pure javascript prevent default
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function disableScroll() {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove  = preventDefault; // mobile
        document.onkeydown  = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }

    return {
        enable: enableScroll,
        disable: disableScroll
    };
})();

module.exports = windowScroll;

},{}],2:[function(require,module,exports){
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

},{"../../js/window-scroll.js":1}],3:[function(require,module,exports){
module.exports = function (className) {
    className = className || "spin-kit";
    var output = '<div class="' + className + '">';
    output += '<div class="sk-circle1 sk-child"></div>';
    output += '<div class="sk-circle2 sk-child"></div>';
    output += '<div class="sk-circle3 sk-child"></div>';
    output += '<div class="sk-circle4 sk-child"></div>';
    output += '<div class="sk-circle5 sk-child"></div>';
    output += '<div class="sk-circle6 sk-child"></div>';
    output += '<div class="sk-circle7 sk-child"></div>';
    output += '<div class="sk-circle8 sk-child"></div>';
    output += '<div class="sk-circle9 sk-child"></div>';
    output += '<div class="sk-circle10 sk-child"></div>';
    output += '<div class="sk-circle11 sk-child"></div>';
    output += '<div class="sk-circle12 sk-child"></div>';
    output += '</div>';
    return output;
};

},{}],4:[function(require,module,exports){
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var DropdownMenu = require("../../modules/dropdown-menu/dropdown-menu.js");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $dropdownMenu = $(".single-col-menu");
if ($dropdownMenu) {
    var dropdown = new DropdownMenu($dropdownMenu, $("#trigger"), {
        triggerOnHover: false,
        multiSelection: false,
        multiSingle: true
    });

    dropdown.onItemClick(function () {
    });
}

},{"../../modules/dropdown-menu/dropdown-menu.js":2,"../../modules/spin-kit/templates/sk-circle.js":3}]},{},[4]);
