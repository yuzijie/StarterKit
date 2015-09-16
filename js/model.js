var XHR = require("./xhr"),
    uniqueId = 0;

var Ev = function (model) {
    this.model = model;
    this.listeners = [];
};

Ev.prototype = {

    attach: function (listener) {
        this.listeners.push(listener);
    },

    detach: function (id) {
        this.listeners.splice(id, 1);
    },

    notify: function (args) {
        var l = this.listeners.length;
        while (l--) {
            this.listeners[l](args, this.model);
        }
    }

};

var Model = function (data) {
    // Data
    this.data = data || {};

    // events
    this.events = {};

    // Ajax request
    this.syncKeys = [];
};

Model.prototype = {

    get: function (keys) {
        var i, key, output = {};

        // convert to array
        if (keys.constructor !== Array) keys = (keys + "").split(" ");

        // get key length
        var length = keys.length;

        // get keys
        if (length === 1) {
            key = keys[0];
            if (key === "undefined") return this.data;
            if (this.data.hasOwnProperty(key)) {
                output[key] = this.data[key];
                return output;
            }
        } else if (length > 1) {
            for (i = 0; i < length; i++) {
                key = keys[i];
                if (this.data.hasOwnProperty(key)) {
                    output[key] = this.data[key];
                }
            }
            return output;
        }
    },

    set: function (data) {
        var keys = this.init(data), i, key, l = keys.length;
        if (l > 0) {
            for (i = 0; i < l; i++) {
                key = keys[i];
                if (this.syncKeys.indexOf(key) === -1) this.syncKeys.push(key);
            }
            if (this.events["change"]) this.events["change"].notify(keys);
        }
    },

    del: function (keys) {
        var deleted = {}, key, i;

        // convert to array
        if (keys.constructor !== Array) keys = (keys + "").split(" ");

        // get length
        var length = keys.length;

        // delete by id
        if (length === 1) {
            key = keys[0];

            if (key === "undefined") {
                deleted = this.data;
                this.data = {};
            } else if (this.data.hasOwnProperty(key)) {
                deleted[key] = this.data[key];
                delete this.data[key];
            }

        } else if (length > 1) {

            for (i = 0; i < length; i++) {
                key = keys[i];
                if (this.data.hasOwnProperty(key)) {
                    deleted[key] = this.data[key];
                    delete this.data[key];
                }
            }
        }

        // notify observers
        if (!isEmpty(deleted) && this.events["delete"]) {
            this.events["delete"].notify(deleted);
        }
    },

    sync: function (url, keys) {
        if (!url) throw "Error! no url for model syncing";
        var _this = this, items = this.get(keys);

        if (!isEmpty(items)) {
            if (this.events["syncStart"]) this.events["syncStart"].notify(items);

            if (this.hasOwnProperty("request")) {
                this.request.updateUrl(url).updateData(items);
            } else {
                this.request = new XHR(url, items);
            }

            // sending request
            this.request.send()
                .done(function (data) {
                    if (data.type !== "fail") {
                        var prop, id;
                        for (prop in items) {
                            if (items.hasOwnProperty(prop)) {
                                id = _this.syncKeys.indexOf(prop);
                                if (id !== -1) _this.syncKeys.splice(id, 1);
                            }
                        }
                        if (_this.events["syncFinish"]) _this.events["syncFinish"].notify(data);
                    } else {
                        if (_this.events["syncFinish"]) _this.events["syncFailed"].notify(data);
                    }
                })
                .fail(function () {
                    if (_this.events["syncFinish"]) _this.events["syncFailed"].notify();
                });
        }
    },

    init: function (data) {
        var key, keys = [];

        if (data instanceof Object) { // accept both object ({}) and array ([])
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    if (this.data.hasOwnProperty(key) && this.data[key] === data[key]) continue;
                    this.data[key] = data[key];
                    keys.push(key);
                }
            }
        } else {
            key = this.uniqueId();
            this.data[key] = data;
            keys.push(key);
        }

        return keys;
    },

    on: function (event, fn) {
        if (!this.events[event]) this.events[event] = new Ev(this);
        this.events[event].attach(fn);
    },

    fire: function (event, args) {
        if (this.events[event]) this.events[event].notify(args);
    },

    uniqueId: function () { // generate an unique id
        var i;
        do {
            i = ++uniqueId + "";
        }
        while (this.data.hasOwnProperty(id));
        return i;
    },

    size: function () { // length of data
        var length = 0, key;
        for (key in this.data) {
            if (this.data.hasOwnProperty(key)) length++;
        }
        return length;
    }

};

// helper
function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
}

module.exports = Model;
