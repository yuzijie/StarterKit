var h = require("./helper"),
    animDetect = require("./anim-detect"),
    overlay = require("./overlay");

// close box when clicking outside of it
function closeOnClick($box, id) {
    $(window).on("click." + id, function (e) {
        if (!h.within(e.target, $box)) $box.trigger("close", {box: $box});
    });
}

// close box when page is scrolling
function closeOnScroll($box, id) {
    $(window).on("scroll." + id, function () {
        $box.trigger("close", {enableAnim: false, box: $box});
    });
}

// turn element into box
module.exports.transform = function (box, options) {
    if (!box) throw "box.on: Missing Box Element!";

    var $box = h.to$(box), preventClose = false,
        opts = $.extend({
            openClass: "box--open",
            closeClass: "box--close"
        }, options);

    // unique id
    var id = h.r4();

    // open action
    function open() {
        if ($box.is(":hidden")) {
            var allow, info = arguments[1] || {};
            if (opts["beforeOpen"]) allow = opts["beforeOpen"](info);

            if (allow !== false) {
                // open the box
                if (opts.hasOverlay === true) overlay.on();
                $box.show().addClass(opts.openClass);

                // set animation finish action
                animDetect.animFinish(true, $box, function () {
                    if (opts["afterOpen"]) opts["afterOpen"](info);
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
            var allow, duration, info = arguments[1] || {};
            if (opts["beforeClose"]) allow = opts["beforeClose"](info);

            if (allow !== false) {
                // close the box
                $box.removeClass(opts.openClass).addClass(opts.closeClass);
                if (opts.hasOverlay === true) overlay.off();

                // set animation finish action
                duration = animDetect.animFinish(info.enableAnim, $box, function () {
                    $box.removeClass(opts.closeClass).hide();
                    if (opts["afterClose"]) opts["afterClose"](info);
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
        toggle: function (event, info) {
            if (!close(event, info)) open(event, info);
        }
    });

    // close on leave
    if (opts.closeOnLeave === true) $box.on("mouseleave", function () {
        $box.trigger("close", {box: $box});
    });

    // assign close button
    $box.on("click", "[data-box-close]", function () {
        $box.trigger("close", {box: $box});
    });

    // helper functions
    function prevent(t) { // prevent close
        preventClose = true;
        setTimeout(function () {
            preventClose = false;
        }, t || 100);
    }
};
