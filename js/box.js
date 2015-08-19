var h = require("./helper");
var animDetect = require("./anim-detect");

// close box when clicking outside of it
function closeOnClick($box, id) {
    $(window).on("click." + id, function (e) {
        if (!h.within(e.target, $box)) $box.trigger("close");
    });
}

// close box when page is scrolling
function closeOnScroll($box, id) {
    $(window).on("scroll." + id, function () {
        $box.trigger("close", false);
    });
}

// animation helper
function animHelper($el, anim, func) {
    var duration = null;

    // listener
    $el.one(animDetect.animationEnd, func);

    // animation is not supported or turned off manually
    if (!animDetect.animationSupport || anim === false) {
        $el.trigger(animDetect.animationEnd);
    } else { // no animation
        duration = $el.css("animation-duration").slice(0, -1) * 1000;
        if (duration === 0) $el.trigger(animDetect.animationEnd);
    }

    return duration;
}

// turn element into box
module.exports.transform = function (box, options) {
    if (!box) throw "box.on: Missing Box Element!";

    var $box = h.to$(box), preventClose = false,
        opts = $.extend({
            openClass: "box--open",
            closeClass: "box--close"
        }, options);

    // assign unique id
    var id = h.r4();
    $box.data("box-id", id);

    // open action
    function open() {
        if ($box.is(":hidden")) {
            var allow;
            if (opts["beforeOpen"]) allow = opts["beforeOpen"]();

            if (allow !== false) {
                // open the box
                $box.addClass(opts.openClass).show();

                // set animation finish action
                animHelper($box, true, function () {
                    if (opts["afterOpen"]) opts["afterOpen"]();
                });

                // set listeners
                setTimeout(function () { // 防止添加 listener 太早，从而 trigger close event
                    if (opts.closeOnClick === true) closeOnClick($box, id);
                    if (opts.closeOnScroll === true) closeOnScroll($box, id);
                }, 50);
            }
        }
        prevent(); // prevent close
        return false;
    }

    // close action
    function close() {
        if ($box.is(":visible") && preventClose === false) {
            var allow, duration;
            if (opts["beforeClose"]) allow = opts["beforeClose"]();

            if (allow !== false) {
                // close the box
                $box.removeClass(opts.openClass).addClass(opts.closeClass);

                // set animation finish action
                duration = animHelper($box, arguments[1], function () {
                    $box.removeClass(opts.closeClass).hide();
                    if (opts["afterClose"]) opts["afterClose"]();
                });

                // reset listeners
                $(window).off("." + id);

                // prevent close
                prevent(duration);
            }
            return true;
        }
        return false;
    }

    // assign events
    $box.on({
        open: open,
        close: close,
        toggle: function () {
            if (!close()) open();
        }
    });

    // close on leave
    if (opts.closeOnLeave === true) $box.on("mouseleave", function () {
        $box.trigger("close");
    });

    // assign close button
    $box.on("click", "[data-box-close]", function () {
        $box.trigger("close");
    });

    // helper functions
    function prevent(t) { // prevent close
        preventClose = true;
        setTimeout(function () {
            preventClose = false;
        }, t || 100);
    }
};

module.exports.getId = function (box) {
    if (box) {
        return h.to$(box).data("box-id");
    } else {
        throw "box.getId: Missing Box Element!";
    }
};
