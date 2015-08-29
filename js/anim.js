var h = require("./helper");

function testAnim($el) {
    // for transition
    var duration = $el.css("transition-duration").slice(0, -1);
    if (duration > 0) return {type: "t", duration: duration * 1000};

    // for animation
    duration = $el.css("animation-duration").slice(0, -1);
    if (duration > 0) return {type: "a", duration: duration * 1000};

    // last
    return {type: null, duration: 0};
}

var sup = {
    animation: h.isSupport("animation") || h.isSupport("webkitAnimation"),
    transform: h.isSupport("transform") || h.isSupport("webkitTransform"),
    animationEnd: h.isSupport("animation") ? "animationend" : "webkitAnimationEnd"
};

function finish(element, func, enable) {
    if (!$.isFunction(func)) throw "Finish function error!";
    var $el = h.to$(element);

    var anim = testAnim($el);
    switch (anim.type) {
        case "t":
            $el.one("transitionend", func);
            // 如果没有 transform support，就自动认为没有 transition support
            if (!sup.transform || enable === false) {
                $el.trigger("transitionend");
                return 0;
            }
            return anim.duration;
        case "a":
            $el.one(sup.animationEnd, func);
            if (!sup.animation || enable === false) {
                $el.trigger(sup.animationEnd);
                return 0;
            }
            return anim.duration;
        default:
            func();
            return anim.duration;
    }
}

module.exports = {
    finish: finish,
    transform: h.isSupport("transform") ? "transform" : "-webkit-transform",
    supportAnimation: sup.animation,
    supportTransition: sup.transform
};
