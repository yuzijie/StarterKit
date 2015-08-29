var h = require("./helper");

function getSec(value) {
    return value.slice(0, -1) * 1000;
}

function testAnim($el) {
    // for transition
    var duration = $el.css("transition-duration");
    if (duration) return {type: "t", duration: getSec(duration)};

    // for animation
    duration = $el.css("animation-duration");
    if (duration) return {type: "a", duration: getSec(duration)};

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
    switch (anim) {
        case "t":
            $el.one("transitionend", func);
            if (!sup.transform || enable === false) { // 如果没有 transform support，就自动认为没有 transition support
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
            return 0;
    }
}

module.exports = {
    finish: finish,
    transform: h.isSupport("transform") ? "transform" : "-webkit-transform",
    supportAnimation: sup.animation,
    supportTransition: sup.transform
};
