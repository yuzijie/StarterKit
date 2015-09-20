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

    get: function (keys) {
        return _get(keys, this);
    },

    set: function (data, desc) {
        var keys = _set(data, this), i, key, l = keys.length;

        if (l > 0) {
            for (i = 0; i < l; i++) {
                key = keys[i];
                if (this.setList.indexOf(key) === -1) this.setList.push(key);
            }
            this.fire("set", {keys: keys, desc: desc});
        }
    },

    add: function (data, desc) {
        var keys = _add(data, this), l = keys.length;

        if (l > 0) this.fire("add", {keys: keys, desc: desc});
    },

    rm: function (keys, desc) {
        var deleted = _rm(keys, this);

        if (!h.isEmptyObj(deleted)) {
            cleanSet(deleted, this);
            this.fire("rm", {data: deleted, desc: desc});
        }
    },

    init: function (type, data) {
        switch (type) {
            case "set":
                _set(data, this);
                break;
            case "add":
                _add(data, this);
                break;
        }
    },

    on: function (event, fn, viewId) {
        if (!this.events[event]) this.events[event] = new Ev(this);
        this.events[event].attach(fn, viewId);
    },

    off: function (viewId) {
        h.forEach(this.events, function (key, event) {
            event.detach(viewId);
        });
    },

    fire: function (event, args) {
        if (this.events[event]) this.events[event].notify(args);
    },

    GET: function (url, desc) {
        desc = desc || "GET";
        _sync(url, null, desc, this);
    },

    POST: function (url, desc) {
        desc = desc || "POST";
        _sync(url, this.setList, desc, this);
    },

    DELETE: function (url, keys, desc) {
        desc = desc || "DELETE";
        _sync(url, keys, desc, this);
    }

    //todo: filter
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

function _sync(url, keys, type, that) {
    var obj;

    if (!url) throw "Model Error! no url for syncing";

    // get sync data
    if (keys == null) {
        obj = null;
    } else {
        obj = _get(keys, that);
    }

    // data is null or data is none empty object
    if (obj === null || !h.isEmptyObj(obj)) {
        that.fire("syncStarted", {data: obj, desc: type});

        if (that.hasOwnProperty("request")) {
            that.request.updateUrl(url).updateData(obj);
        } else {
            that.request = new XHR(url, obj);
        }

        that.request.send().done(function (data) {
            if (data.type !== "fail") {
                if (obj) cleanSet(obj, that);
                that.fire("syncFinished", {data: data, desc: type});
            } else {
                that.fire("syncFailed", {data: data, desc: type});
            }
        });
    }
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
