var box = require("./box"),
    dom = require("./dom");

var target = $(document.body), id,
    overlay = '<figure class="overlay"></figure>';

module.exports.on = function () {
    id = dom.append(overlay, target, function ($el) {
        box.transform($el, {
            openClass: "overlay--open",
            closeClass: "overlay--close"
        });
        $el.trigger("open");
    });
};

module.exports.off = function () {
    dom.remove(id, function ($el) {
        $el.trigger("close");
    });
};