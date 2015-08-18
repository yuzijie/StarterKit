var h = require("./helper");
var animDetect = require("./anim-detect");

// messages
var msg = {
    e1: "Missing Box Element!"
};

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

// turn element into box
module.exports.on = function (box, options) {
    if (box) {
        var $box = h.to$(box),
            opts = options || {},
            preventClose = false;
    } else {
        throw "box.on: " + msg.e1;
    }

    // assign unique id
    var id = h.r4();
    $box.data("box-id", id);

    // open action
    function open() {
        if ($box.is(":hidden")) {
            var allow;
            if (opts["beforeOpen"]) allow = opts["beforeOpen"]();

            if (allow !== false) {
                $box.addClass("box--open").show();
                setTimeout(function () {
                    if (opts.closeOnClick === true) closeOnClick($box, id);
                    if (opts.closeOnScroll === true) closeOnScroll($box, id);
                }, 50);
                if (opts["afterOpen"]) opts["afterOpen"]();
            }
            return true;
        }
        return false;
    }

    // close action
    function close(animation) {
        if ($box.is(":visible") && preventClose === false) {
            var allow, duration;
            if (opts["beforeClose"]) allow = opts["beforeClose"]();

            if (allow !== false) {
                // close the box
                $box.removeClass("box--open").addClass("box--close");
                $box.one(animDetect.animationEnd, function () {
                    $box.removeClass("box--close").hide();
                    if (opts["afterClose"]) opts["afterClose"]();
                });

                // animation is not supported or turned off manually
                if (!animDetect.animationSupport || animation === false) {
                    $box.trigger(animDetect.animationEnd);
                } else { // no animation
                    duration = $box.css("animation-duration").slice(0, -1) * 1000;
                    if (duration === 0) $box.trigger(animDetect.animationEnd);
                }

                // reset listeners
                $(window).off("." + id);
            }
            prevent(duration); // prevent close
        }
    }

    // assign events
    $box.on({
        open: function () {
            open();
            prevent(); // prevent close
        },
        close: function (event, animation) {
            close(animation);
        },
        toggle: function () {
            if (!open()) close();
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
        throw "box.getId: " + msg.e1;
    }
};
