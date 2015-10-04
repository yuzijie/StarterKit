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

///////////// View Methods /////////////

function _bindDomEvents(that) {
    if (that["domEvents"] && that.el) {
        h.forEach(that["domEvents"], function (key, fn) {
            if (!h.isFunction(fn)) fn = that[fn];
            var parts = key.split(splitter, 2);

            if (parts[0] === "this") {
                that.el.on(parts[1], function (e) { // [1]: event
                    fn.call(that, e, this);
                });
            } else {
                that.el.on(parts[1], parts[0], function (e) { // [1]: event, [0]: selector
                    fn.call(that, e, this);
                });
            }
        });
    }
}

function _bindModelEvents(that) {
    if (that["modelEvents"] && that.models) {
        h.forEach(that["modelEvents"], function (key, fn) {
            if (!h.isFunction(fn)) fn = that[fn];
            var parts = key.split(splitter, 3);

            that.models[parts[0]].on(parts[1], function (args) { // [0]: model name, [1]: event
                if (parts[2] === args.desc) fn.call(that, args.data); // [2]: desc
            }, that.viewId);
        });
    }
}

function _render(model, that) {
    if (that.template) {
        var temp = that.el;

        if (model) {
            that.el = $(that.template(model.get()));
        } else {
            that.el = $(that.template());
        }

        // if that.el already exists
        if (temp) temp.replaceWith(that.el);

        // bind events
        _bindDomEvents(that);
    }
    return that;
}

function _destroy(that) {
    // remove dom element
    if (that.el) that.el.remove();

    // remove model listeners
    if (that.models) h.forEach(that.models, function (key, model) {
        model.off(that.viewId);
    });

    // delete properties
    h.forEach(that, function (prop) {
        delete that[prop];
    });
}

///////////// View and Model Methods /////////////

function _listen(model, event, arg3, arg4, that, id) {
    var desc, fn;

    if (arg4 == null) {   // model, event, function
        desc = void 0; // undefined
        fn = h.isFunction(arg3) ? arg3 : that[arg3];
    } else {              // model, event, desc and function
        desc = arg3;
        fn = h.isFunction(arg4) ? arg4 : that[arg4];
    }

    model.on(event, function (args) {
        if (desc === args.desc) fn.call(that, args.data);
    }, id);
}

///////////// Inheritance Methods /////////////

function _extend(props, that) {
    var parent = that, child;

    child = function () {
        parent.apply(this, arguments);
    };

    child.prototype = Object.create(parent.prototype); // inherit

    if (props) h.forEach(props, function (key, value) {
        child.prototype[key] = value;
    });

    child.prototype.constructor = child;

    return child;
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
    "changed": _changed,
    // view
    "bindDomEvents": _bindDomEvents,
    "bindModelEvents": _bindModelEvents,
    "render": _render,
    "destroy": _destroy,
    // view and model
    "listen": _listen,
    // inheritance
    "extend": _extend
};