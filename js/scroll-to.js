// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var scrollTo = function (target, options) {
    target = to$(target);
    options = options || {};

    if (options["container"]) {
        var container = to$(options["container"]);
        container.stop().animate({
            scrollTop: target.offset().top - container.offset().top + container.scrollTop()
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"]();
        });
    } else {
        $(document.body).stop().animate({
            scrollTop: target.offset().top
        }, options.duration || '1000', function () {
            if (options["onFinish"]) options["onFinish"]();
        });
    }
};

module.exports = scrollTo;
