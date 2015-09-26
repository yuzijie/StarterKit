var XHR = require("./xhr"),
    Ev = require("./event"),
    h = require("./helper");

var Model = function (data) {
    // Data
    this.data = data || {};

    // events
    this.events = {};

    // watch set data
    this.setList = [];
};

Model.prototype = {

    "get": function (keys) {
        return _get(keys, this);
    },

    "pick": function (options) { // filter and sort
        return _pick(options, this);
    },

    "one": function (str) {
        var i, obj = _get(str, this);
        for (i in obj) {
            if (obj.hasOwnProperty(i)) return obj[i];
        }
    },

    "set": function (data, arg2, arg3) {
        var keys, i, key, l, obj = {}, desc = arg2;

        if (data instanceof jQuery) {              // data is a form element
            keys = _setFormData(data, this);
        } else if (data.constructor === String) {  // data is a key
            obj[data] = arg2;
            desc = arg3;
            keys = _set(obj, this);
        } else {                                   // data is an object
            keys = _set(data, this);
        }

        l = keys.length;

        if (l > 0) {
            for (i = 0; i < l; i++) {
                key = keys[i];
                if (this.setList.indexOf(key) === -1) this.setList.push(key);
            }
            this.fire("set", {data: keys, desc: desc});
        }
    },

    "add": function (data, desc) {
        var keys = _add(data, this), l = keys.length;

        if (l > 0) this.fire("add", {data: keys, desc: desc});
    },

    "rm": function (keys, desc) {
        var deleted = _rm(keys, this);

        if (!h.isEmptyObj(deleted)) {
            cleanSet(deleted, this);
            this.fire("rm", {data: deleted, desc: desc});
        }
    },

    "call": function (url, keys, options) { // call remote server
        _sync(url, keys, options, this);
    },

    "init": function (type, data, arg3) {
        var obj = {};
        switch (type) {
            case "set":
                if (data instanceof jQuery) {              // data is a form element
                    _setFormData(data, this);
                } else if (data.constructor === String) {  // data is a key
                    obj[data] = arg3;
                    _set(obj, this);
                } else _set(data, this);                   // data is an object
                break;
            case "add":
                _add(data, this);
                break;
        }
    },

    "on": function (event, fn, viewId) {
        if (!this.events[event]) this.events[event] = new Ev(this);
        this.events[event].attach(fn, viewId);
    },

    "off": function (viewId) {
        h.forEach(this.events, function (key, event) {
            event.detach(viewId);
        });
    },

    "fire": function (event, args) {
        if (this.events[event]) this.events[event].notify(args);
    },

    "do": function (desc, data) {
        this.fire("do", {data: data, desc: desc});
    },

    "listen": function (model, event, arg3, arg4) {
        var desc, fn;

        if (h.isFunction(arg3)) { // model, event and function
            desc = void 0; // undefined
            fn = arg3;
        } else { // model, event, desc and function
            desc = arg3;
            fn = arg4;
        }

        if (!this.modelId) this.modelId = h.r4();

        model.on(event, function (args) {
            if (desc === args.desc) fn(args.data);
        }, this.modelId);
    },

    "size": function () {
        var count = 0;
        h.forEach(this.data, function () {
            count++;
        });
        return count;
    }
};

// basic methods
function _set(data, that) { // only allow object
    var keys = [];

    if (typeof data === 'object' && !!data) { // data must be object
        h.forEach(data, function (key, value) {
            if (that.data.hasOwnProperty(key) && that.data[key] === value) return;
            that.data[key] = data[key];
            keys.push(key);
        });
    }

    return keys;
}

function _add(data, that) { // only push a single item
    var key = h.r8(), keys = [];

    if (data != null) { // don't allow null or undefined
        that.data[key] = data;
        keys.push(key);
    }

    return keys;
}

function _rm(keys, that) { // remove property from data by keys
    var rm = {}, key, i;

    if (keys == null) { // keys is null or undefined

        rm = that.data;
        that.data = {};

    } else {

        // convert to array
        if (keys.constructor !== Array) keys = (keys + "").split(" ");

        // get length
        var length = keys.length;

        // delete data
        for (i = 0; i < length; i++) {
            key = keys[i];
            if (that.data.hasOwnProperty(key)) {
                rm[key] = that.data[key];
                delete that.data[key];
            }
        }
    }

    return rm;
}

function _get(keys, that) {
    var output = {}, key, i;

    if (keys == null) { // keys is null or undefined

        output = that.data;

    } else {

        // convert to array
        if (keys.constructor !== Array) keys = (keys + "").split(" ");

        // get key length
        var length = keys.length;

        // get data
        for (i = 0; i < length; i++) {
            key = keys[i];
            if (that.data.hasOwnProperty(key)) {
                output[key] = that.data[key];
            }
        }
    }

    return output;
}

function _sync(url, keys, options, that) {
    if (!url) throw "Model Error! no url to call";
    var obj;

    // get sync data
    if (keys == null) {
        obj = null;
    } else {
        obj = _get(keys, that);
    }

    // data is null or data is none empty object
    if (obj === null || !h.isEmptyObj(obj)) {
        if (that.hasOwnProperty("request")) {
            that.request.updateUrl(url).updateData(obj);
        } else {
            that.request = new XHR(url, obj);
        }

        that.request.send().done(function (data) {
            if (data.type === "success" && obj) cleanSet(obj, that);
            if (options[data.type]) options[data.type](data);
        }).fail(function () {
            if (options["error"]) options["error"]();
        });
    }
}

function _setFormData(form, that) { // set data from form
    var serializeArray = form.serializeArray(),
        output = {}, i, len, item, l;

    for (i = 0, len = serializeArray.length; i < len; i++) {
        item = serializeArray[i];
        l = item.name.length;
        if (item.name.indexOf("[]", l - 2) !== -1) {
            var name = item.name.substring(0, l - 2);
            if (!output[name]) output[name] = [];
            output[name].push(item.value);
        } else {
            output[item.name] = item.value;
        }
    }

    return _set(output, that);
}

function _pick(options, that) {
    var output = [];

    h.forEach(that.data, function (key, value) {
        output.push(value);
    });

    return output;
}

function cleanSet(obj, that) {
    var i, l, key, array = that.setList, tmp = [];
    for (i = 0, l = array.length; i < l; i++) {
        key = array[i];
        if (!obj.hasOwnProperty(key)) tmp.push(key);
    }
    that.setList = tmp;
}

module.exports = Model;
