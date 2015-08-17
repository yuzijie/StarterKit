var h = require("./helper.js");

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
        $box.trigger("close");
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
            $box.show();
            setTimeout(function () {
                if (opts.closeOnClick === true) closeOnClick($box, id);
                if (opts.closeOnScroll === true) closeOnScroll($box, id);
            }, 50);
            return true;
        }
        return false;
    }

    // close action
    function close() {
        if ($box.is(":visible") && preventClose === false) {
            $box.hide();
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
        close: close,
        toggle: function () {
            if (!open()) close();
        }
    });

    if (opts.closeOnLeave === true) $box.on("mouseleave", function () {
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
