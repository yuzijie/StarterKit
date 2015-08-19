var box = require("./box"),
    dom = require("./dom"),
    h = require("./helper"),
    template = function (msg) {
        return '<div class="tooltip">' + msg + '</div>';
    };

module.exports.show = function (msg, target) {
    var tooltip = $(template(msg));

    var id = dom.append(tooltip, target, function ($el) {
        box.transform($el, {
            openClass: "tooltip--open",
            closeClass: "tooltip--close",
            afterClose: function (info) {
                if (info.tid) dom.remove(info.tid);
            }
        });
        $el.trigger("open");
    });

    h.to$(target).data("tooltip-id", id);
};

module.exports.remove = function (target) {
    if (!target) throw "remove tooltip: target missing!";
    target = h.to$(target);

    var id = target.data("tooltip-id");
    if (id) {
        target.data("tooltip-id", "");
        dom.element(id).trigger("close", {tid: id});
    }
};
