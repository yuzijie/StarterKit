var box = require("./box"),
    dom = require("./dom"),
    h = require("./helper"),
    template = function (msg) {
        return '<div class="tooltip">' + msg + '&nbsp;<span data-box-close>&times;</span></div>';
    };

var show = function (msg, target) {
    var tooltip = $(template(msg));
    if (target) target = h.to$(target);

    if (target.is("[data-tooltip]") && !dom.element(target.data("tooltip-id"))) {
        var id = dom.append(tooltip, target, function ($el) {
            box.transform($el, {
                openClass: "tooltip--open",
                closeClass: "tooltip--close",
                afterClose: function (info) {
                    if (info.tid) return dom.remove(info.tid);
                    if (info.box) return dom.remove(info.box);
                }
            });
            $el.trigger("open");
        });
        target.data("tooltip-id", id);
        return true;
    }
    return false;
};

var remove = function (target) {
    if (!target) throw "remove tooltip: target missing!";
    target = h.to$(target);

    if (target.is("[data-tooltip]")) {
        var id = target.data("tooltip-id");
        target.data("tooltip-id", "");
        if (id && dom.element(id)) {
            dom.element(id).trigger("close", {tid: id});
        }
    }
};

var toggle = function (msg, target) {
    if (!show(msg, target)) remove(target);
};

module.exports = {show: show, remove: remove, toggle: toggle};
