function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function r4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function within(target, element) {
    element = to$(element);
    return (element.is(target) || element.has(target).length);
}

function isSupport(property) {
    return property in document.body.style;
}

function isFunction(fn) {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
}

module.exports = {
    to$: to$,
    r4: r4,
    within: within,
    isSupport: isSupport,
    isFunction: isFunction
};
