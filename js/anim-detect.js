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

module.exports = supportTest;
