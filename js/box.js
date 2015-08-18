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
        $box.trigger("close", {animation: false});
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
            $box.addClass("box--open").show();
            setTimeout(function () {
                if (opts.closeOnClick === true) closeOnClick($box, id);
                if (opts.closeOnScroll === true) closeOnScroll($box, id);
            }, 50);
            return true;
        }
        return false;
    }

    // close action
    function close(opts) {
        if ($box.is(":visible") && preventClose === false) {
            opts = opts || {};

            // close the box
            $box.removeClass("box--open").addClass("box--close");
            $box.one(animDetect.animationEnd, function () {
                $box.removeClass("box--close").hide();
            });

            // animation is not supported or turned off manually
            if (!animDetect.animationSupport || opts.animation === false) {
                $box.trigger(animDetect.animationEnd);
            } else { // no animation
                var duration = $box.css("animation-duration").slice(0, -1) * 1000;
                if (duration === 0) $box.trigger(animDetect.animationEnd);
            }

            // reset listeners
            $(window).off("." + id);
        }
    }

    // assign events
    $box.on({
        open: function () {
            open();
            preventClose = true;
            setTimeout(function () {
                preventClose = false;
            }, 50);
        },
        close: function (event, opts) {
            close(opts);
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
};

module.exports.getId = function (box) {
    if (box) {
        return h.to$(box).data("box-id");
    } else {
        throw "box.getId: " + msg.e1;
    }
};
