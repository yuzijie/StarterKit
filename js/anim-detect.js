function isSupported(property) {
    return property in document.body.style;
}

var ias = isSupported("animation");

var supportTest = {
    transitionSupport: isSupported("transition"),
    animationSupport: ias || isSupported("webkitAnimation"),
    animationStart: ias ? "animationstart" : "webkitAnimationStart",
    animationIteration: ias ? "animationiteration" : "webkitAnimationIteration",
    animationEnd: ias ? "animationend" : "webkitAnimationEnd"
};

supportTest.animFinish = function (enable, $el, func) {
    if (!$.isFunction(func)) throw "animation finish function error!";

    var duration = null;

    // listener
    $el.one(supportTest.animationEnd, func);

    // animation is not supported or turned off manually
    if (!supportTest.animationSupport || enable === false) {
        $el.trigger(supportTest.animationEnd);
    } else { // no animation
        duration = $el.css("animation-duration").slice(0, -1) * 1000;
        if (duration === 0) $el.trigger(supportTest.animationEnd);
    }

    return duration;
};

module.exports = supportTest;
