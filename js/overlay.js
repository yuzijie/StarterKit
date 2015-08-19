var box = require("./box"),
    dom = require("./dom"),
    scrollbar = require("./scrollbar");

var target = $(document.body), id,
    el = '<figure class="overlay"></figure>';

module.exports.on = function () {
    id = dom.append(el, target, function ($el) {
        box.transform($el, {
            openClass: "overlay--open",
            closeClass: "overlay--close",
            beforeOpen: function () {
                scrollbar.setPadding();
            },
            afterClose: function () {
                scrollbar.resetPadding();
                dom.remove(id);
            }
        });
        $el.trigger("open");
    });
};

module.exports.off = function () {
    var el = dom.element(id);
    el.trigger("close");
};