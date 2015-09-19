var XHR = require("./xhr"),
    Ev = require("./event"),
    h = require("./helper");

var Model = function (data) {
    // Data
    this.data = data || {};

    // events
    this.events = {};

    // watch modified data
    this.watch = {set: [], add: []};
};

Model.prototype = {

    get: function (keys) {
        return _get(keys, this);
    },

    set: function (data) {
        var keys = _set(data, this), i, key, l = keys.length;

        if (l > 0) {
            for (i = 0; i < l; i++) {
                key = keys[i];
                if (this.watch.set.indexOf(key) === -1) this.watch.set.push(key);
            }
            if (this.events["set"]) this.events["set"].notify(keys);
        }
    },

    add: function (data) {
        var keys = _add(data, this), key, l = keys.length;

        if (l > 0) {
            key = keys[0];
            if (this.watch.add.indexOf(key) === -1) this.watch.add.push(key);
            if (this.events["add"]) this.events["add"].notify(keys);
        }
    },

    rm: function (keys) {
        var deleted = _rm(keys, this);

        if (!h.isEmptyObj(deleted)) {
            cleanWatch(deleted, this);
            if (this.events["rm"]) this.events["rm"].notify(deleted);
        }
    },

    sync: function (url, keys) {
        if (!url) throw "Error! no url for syncing";
        var _this = this, items = this.get(keys);

        if (!h.isEmptyObj(items)) {
            if (this.events["syncStarted"]) this.events["syncStarted"].notify(items);

            if (this.hasOwnProperty("request")) {
                this.request.updateUrl(url).updateData(items);
            } else {
                this.request = new XHR(url, items);
            }

            // sending request
            this.request.send()
                .done(function (data) {
                    if (data.type !== "fail") {
                        cleanWatch(items, _this);
                        if (_this.events["syncFinished"]) _this.events["syncFinished"].notify(data);
                    } else {
                        if (_this.events["syncFailed"]) _this.events["syncFailed"].notify(data);
                    }
                })
                .fail(function () {
                    if (_this.events["syncFailed"]) _this.events["syncFailed"].notify();
                });
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

    fire: function (event, args) {
        if (this.events[event]) this.events[event].notify(args);
    },

    off: function (viewId) {
        h.forEach(this.events, function (key, event) {
            event.detach(viewId);
        });
    }

    // todo: filter
};

// basic methods
function _set(data, that) { // only allow object
    var keys = [];

    if (typeof data === 'object' && !!data) {
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

    if (typeof data !== "undefined") {
        that.data[key] = data;
        keys.push(key);
    }

    return keys;
}

function _rm(keys, that) { // remove property from data by keys
    var rm = {}, key, i;

    // convert to array
    if (keys.constructor !== Array) keys = (keys + "").split(" ");

    // get length
    var length = keys.length;

    // delete
    if (length === 1) {
        key = keys[0];

        if (key === "undefined") { // delete everything
            rm = that.data;
            that.data = {};
        } else if (that.data.hasOwnProperty(key)) {
            rm[key] = that.data[key];
            delete that.data[key];
        }

    } else if (length > 1) {

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
    var i, key, output = {};

    // convert to array
    if (keys.constructor !== Array) keys = (keys + "").split(" ");

    // get key length
    var length = keys.length;

    // get keys
    if (length === 1) {
        key = keys[0];

        if (key === "undefined") {
            output = that.data;
        } else if (that.data.hasOwnProperty(key)) {
            output[key] = that.data[key];
        }

    } else if (length > 1) {

        for (i = 0; i < length; i++) {
            key = keys[i];
            if (that.data.hasOwnProperty(key)) {
                output[key] = that.data[key];
            }
        }
    }

    return output;
}

function cleanWatch(obj, that) {
    var i, l, k, key, array, tmp;

    for (key in that.watch) {
        if (that.watch.hasOwnProperty(key)) {
            tmp = [];
            array = that.watch[key];
            for (i = 0, l = array.length; i < l; i++) {
                k = array[i];
                if (!obj.hasOwnProperty(k)) tmp.push(k);
            }
            array = tmp;
        }
    }
}

module.exports = Model;
