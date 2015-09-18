function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function r4() { // 4 位随机字符串
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function r8() { // 8 位随机字符串
    return r4() + r4();
}

function within(target, element) { // if target within element
    element = to$(element);
    return (element.is(target) || element.has(target).length);
}

function isSupport(property) { // is css3 style is support
    return property in document.body.style;
}

function isFunction(fn) {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
}

function forEach(obj, callback) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) callback(i, obj[i]);
    }
}

function isEmptyObj(obj) { // object is empty
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
}

module.exports = {
    to$: to$,
    r4: r4,
    r8: r8,
    forEach: forEach,
    within: within,
    isSupport: isSupport,
    isFunction: isFunction,
    isEmptyObj: isEmptyObj
};
