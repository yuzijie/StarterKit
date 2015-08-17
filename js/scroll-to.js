var h = require("./helper.js");

var scrollTo = function (target, options) {
    target = h.to$(target);
    options = options || {};

    if (options["container"]) {
        var container = h.to$(options["container"]);
        container.stop().animate({
            scrollTop: target.offset().top - container.offset().top + container.scrollTop()
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"](target[0]);
        });
    } else {
        $(document.body).stop().animate({
            scrollTop: target.offset().top
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"](target[0]);
        });
    }
};

module.exports = scrollTo;
