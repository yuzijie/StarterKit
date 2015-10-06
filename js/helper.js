function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function r4(prefix) { // 4 位随机字符串
    var digits = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return (prefix) ? prefix + digits : digits;
}

function within(target, element) { // if target within element
    element = to$(element);
    return (element.is(target) || element.has(target).length);
}

function isSupport(property) { // is css3 style is support
    return property in document.body.style;
}

function isFunction(object) {
    return !!(object && object.constructor && object.call && object.apply);
}

function forEach(obj, callback) {
    var i, l;
    if (obj instanceof Array) {
        l = obj.length;
        for (i = 0; i < l; i++) callback(i, obj[i]);
    } else {
        for (i in obj) {
            if (obj.hasOwnProperty(i)) callback(i, obj[i]);
        }
    }
}

function isEmptyObj(obj) { // object is empty
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
}

function size(obj) { // object size
    var count = 0;
    forEach(obj, function () {
        count++;
    });
    return count;
}

module.exports = {
    to$: to$,
    r4: r4,
    forEach: forEach,
    within: within,
    isSupport: isSupport,
    isFunction: isFunction,
    isEmptyObj: isEmptyObj,
    size: size
};
