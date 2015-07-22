(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// prevent parent element from scrolling when scroll child element
// require jQuery Mouse Wheel Plugin
require("../node_modules/jquery-mousewheel/jquery.mousewheel.js")($);

var PreventScroll = function ($target) {
    $target.on("mousewheel", function (e) {
        if (($target.scrollTop() === $target[0].scrollHeight - $target.outerHeight() && e.deltaY < 0) ||
            ($target.scrollTop() === 0 && e.deltaY > 0)) {
            e.preventDefault();
        }
    });
};

module.exports = PreventScroll;

},{"../node_modules/jquery-mousewheel/jquery.mousewheel.js":4}],2:[function(require,module,exports){
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
        multiSelection: false,  // Select multiple items
        preventClose: [],       // Prevent menu close when clicking these elements
        preventScroll: null,    // Elements that need background scroll prevention
        highlightResult: false  // highlight matched string
    }, options);

    // "preventClose" array
    if (options.preventClose && options.preventClose.constructor !== Array) {
        this.opts.preventClose = [this.$menu, this.opts.preventClose]
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

DropdownMenu.prototype.clearSelected = function () {
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

DropdownMenu.prototype.getValues = function (context) {
    var self = context || this;
    var output = [];

    self.$items.filter(".S").each(function () {
        output.push($(this).data("value"));
    });

    if (output.length > 0) return output;
    return null;
};

DropdownMenu.prototype.filter = function (searchString) {
    var regex = "", $items = [];

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
            $items.push($this);
        } else {
            if ($this.not(".H")) $this.addClass("H");
        }
    });

    if(this.itemFilterAction) this.itemFilterAction($items);
    return $items;
};

module.exports = DropdownMenu;

},{"../../js/prevent-scroll.js":1}],3:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var DropdownMenu = require("../../modules/dropdown-menu/dropdown-menu.js");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $dropdownMenu = $(".single-col-menu");
var $input = $("#trigger");

if ($dropdownMenu) {
    var dropdown = new DropdownMenu($dropdownMenu, {
        preventClose: $input
    });

    dropdown.onMenuClose(function(){
        this.showAll().clearSelection();
    });

    dropdown.onItemClick(function($this){
        $input.find("#input").val($this.data("value"));
    });

    $input.find("#input").on("keyup", function () {
        var text = $(this).val();
        dropdown.filter(text).open();
    });

    $input.find("#input").on("focus", function () {
        dropdown.open();
    });
}

},{"../../modules/dropdown-menu/dropdown-menu.js":2,"../../modules/spin-kit/templates/sk-circle.js":3}]},{},[5]);
