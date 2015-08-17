var h = require("./helper.js");

var msg = {
    e1: "Missing Box Element!"
};

// close box when clicking outside of it
function closeOnClick($box, id) {
    $(window).on("click." + id, function (e) {
        if (!h.within(e.target, $box)) $box.trigger("close");
    });
}

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
            setTimeout(function () { // bind listeners
                if (opts.closeOnClick === true) closeOnClick($box, id);
            }, 50);
            return true;
        }
        preventClose = true;
        return false;
    }

    // close action
    function close() {
        if ($box.is(":visible") && preventClose === false) {
            $box.hide();
            $(window).off("." + id); // clear listeners
            return true;
        }
        preventClose = false;
        return false;
    }

    // toggle action
    function toggle() {
        if (!open()) close();
    }

    $box.on({
        open: open,
        close: close,
        toggle: toggle
    });
};

module.exports.getId = function (box) {
    if (box) {
        return h.to$(box).data("box-id");
    } else {
        throw "box.getId: " + msg.e1;
    }
};
