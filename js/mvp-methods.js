var h = require("./helper"),
    XHR = require("./xhr"),

    splitter = /\s+/;

///////////// Event Methods /////////////

function _detach(obj, that) {               // detach by listener or id
    if (!obj) {                             // if object is a falsy value, remove all
        that.listeners = [];
    } else if (obj instanceof Function) {   // if object is a listener
        h.forEach(that.listeners, function (i, listener) {
            if (obj === listener) {
                that.listeners.splice(i, 1);
                that.ids.splice(i, 1);
            }
        });
    } else {                                // else treat object as an id
        h.forEach(that.ids, function (i, id) {
            if (obj === id) {
                that.listeners.splice(i, 1);
                that.ids.splice(i, 1);
            }
        });
    }
}

function _notify(args, context, that) {
    h.forEach(that.listeners, function (i, listener) {
        listener.call(context, args);
    });
}

///////////// Model Methods /////////////

function _get(keys, that) {
    var output = {};

    if (keys == null) {
        output = that.data;
    } else {
        if (keys.constructor !== Array) keys = (keys + "").split(splitter);
        h.forEach(keys, function (i, key) {
            if (that.data.hasOwnProperty(key)) output[key] = that.data[key];
        });
    }

    return output;
}

function _pick(opts, that) {
    opts = opts || {};

    var output = [], item;

    if (opts.filter) {
        h.forEach(that.data, function (key, value) {
            item = opts.filter(key, value);
            output.push(item);
        });
    } else {
        h.forEach(that.data, function (key, value) {
            output.push(value);
        });
    }

    if (opts.sort) output.sort(opts.sort);
    if (opts.reverse === true) output.reverse();

    return output;
}

function _set(data, that) {
    var keys = [];

    if (typeof data === 'object' && !!data) {
        h.forEach(data, function (key, value) {
            if (that.data.hasOwnProperty(key) && that.data[key] === value) return;
            that.data[key] = value;
            keys.push(key);
        });
    } else {
        throw "data must be an object!";
    }

    return keys;
}

function _setFormData(form, that) {
    var dataArray = form.serializeArray(), output = {}, name, l, key;

    h.forEach(dataArray, function (i, item) {
        name = item.name;
        l = name.length;
        if (name.indexOf("[]", l - 2) !== -1) {
            key = name.substring(0, l - 2);
            if (!output[key]) output[key] = [];
            output[key].push(item.value);
        } else {
            output[name] = item.value;
        }
    });

    return _set(output, that);
}

function _add(data, that) {
    var key;

    if (data != null && data.hasOwnProperty("modelId")) {
        key = data.modelId;
        that.data[key] = data;
    } else {
        throw "You can only add a model";
    }

    return key;
}

function _rm(keys, that) {
    var rm = {};

    if (keys == null) {
        rm = that.data;
        that.data = {};
    } else {
        if (keys.constructor !== Array) keys = (keys + "").split(splitter);
        h.forEach(keys, function (i, key) {
            if (that.data.hasOwnProperty(key)) {
                rm[key] = that.data[key];
                delete that.data[key];
            }
        });
    }

    return rm;
}

function _call(url, keys, opts, that) {
    var obj;

    if (keys == null) {
        obj = null;
    } else {
        obj = _get(keys, that);
    }

    if (obj === null || !h.isEmptyObj(obj)) {
        if (that.hasOwnProperty("xhr")) {
            that.xhr.updateUrl(url).updateData(obj);
        } else {
            that.xhr = new XHR(url, obj);
        }

        that.xhr.send().done(function (data) {
            if (data.type === "success" && obj) _cleanSet(obj, that);
            if (opts[data.type]) opts[data.type].call(that, data);
        }).fail(function () {
            if (opts["error"]) opts["error"].call(that);
        });
    }
}

function _cleanSet(obj, that) {
    var tmp = [];
    h.forEach(that.setList, function (i, key) {
        if (!obj.hasOwnProperty(key)) tmp.push(key);
    });
    that.setList = tmp;
}

function _changed(keys, that) {
    if (keys != null) {
        if (keys.constructor !== Array) keys = (keys + "").split(splitter);
        h.forEach(keys, function (i, key) {
            if (that.data.hasOwnProperty(key) && that.setList.indexOf(key) === -1) that.setList.push(key);
        });
    }

    return that.setList;
}

module.exports = {
    // event
    "detach": _detach,
    "notify": _notify,
    // model
    "get": _get,
    "pick": _pick,
    "set": _set,
    "setFormData": _setFormData,
    "add": _add,
    "rm": _rm,
    "call": _call,
    "cleanSet": _cleanSet,
    "changed": _changed
};