function isSupported(property) {
    return property in document.body.style;
}

var ias = isSupported("animation");
var its = isSupported("transform");

var supportTest = {
    transitionSupport: isSupported("transition"),
    animationSupport: ias || isSupported("webkitAnimation"),
    transformSupport: its || isSupported("webkitTransform"),
    transform: its ? "transform" : "-webkit-transform", // css transform style
    animationStart: ias ? "animationstart" : "webkitAnimationStart", // javascript animation events
    animationIteration: ias ? "animationiteration" : "webkitAnimationIteration", // javascript animation events
    animationEnd: ias ? "animationend" : "webkitAnimationEnd" // javascript animation events
};

supportTest.animFinish = function (enable, $el, func) { // after animation finish
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

supportTest.tranFinish = function (enable, $el, func) { // after transform finish
    if (!$.isFunction(func)) throw "transition finish function error!";

    var duration = null;

    // listener
    $el.one("transitionend", func);

    // transition or transform is not supported or turned off manually
    if (!supportTest.transitionSupport || !supportTest.transformSupport || enable === false) {
        $el.trigger("transitionend");
    } else { // no transition
        duration = $el.css("transition-duration").slice(0, -1) * 1000;

        console.log(duration);

        if (duration === 0) $el.trigger("transitionend");
    }

    return duration;
};

module.exports = supportTest;
