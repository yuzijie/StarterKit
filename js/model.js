var XHR = require("./xhr");

var Ev = function (sender) {
    this.sender = sender;
    this.listeners = [];
};

Ev.prototype = {

    attach: function (listener) {
        this.listeners.push(listener);
    },

    notify: function (args) {
        var i = this.listeners.length;
        while (i--) {
            this.listeners[i](args, this.sender);
        }
    }

};

// for updating Model data
function updateData(data, model) {
    var i, keys = [], _data = model.data;

    if (data instanceof Object) {
        for (i in data) {
            if (data.hasOwnProperty(i)) {

                if (_data.hasOwnProperty(i)) {
                    if (_data[i] !== data[i]) {
                        _data[i] = data[i];
                        keys.push(i);
                    }
                } else {
                    _data[i] = data[i];
                    keys.push(i);
                }
            }
        }
    } else {

        var key = ++model.id + "";
        _data[key] = data;
        keys.push(key);
    }

    return keys;
}

var Model = function (data) {
    this.id = 0;
    this.data = data || {};

    // events
    this.updateEvent = new Ev(this);
    this.deleteEvent = new Ev(this);
    this.syncStartEvent = new Ev(this);
    this.syncFinishEvent = new Ev(this);
    this.syncFailEvent = new Ev(this);

    // Ajax
    this.request = new XHR();
    this.syncKeys = []; // data to sync
};

Model.prototype = {

    get: function (keys) {
        if (keys || keys === 0) {
            var i, key, output = {};

            if (keys.constructor === Array) {
                i = keys.length;
                while (i--) {
                    key = keys[i];
                    output[key] = this.data[i];
                }
                return output;
            }
            return this.data[keys];
        }
        return this.data;
    },

    update: function (data) {
        var i, keys = updateData(data, this);
        if (i = keys.length) {
            while (i--) {
                if (this.syncKeys.indexOf(keys[i]) === -1) this.syncKeys.push(keys[i]);
            }
            this.updateEvent.notify(keys);
        }
    },

    delete: function (keys) {
        var deleted = {};

        if (keys || keys === 0) {
            var i, key;

            if (keys.constructor === Array) {
                i = keys.length;

                while (i--) {
                    key = keys[i];
                    if (this.data.hasOwnProperty(key)) {
                        deleted[key] = this.data[key];
                        delete this.data[key];
                    }
                }
            } else {

                if (this.data.hasOwnProperty(keys)) {
                    deleted[keys] = this.data[keys];
                    delete this.data[keys];
                }
            }
        } else {

            deleted = this.data;
            this.data = {};
        }

        if (deleted) this.deleteEvent.notify(deleted);
    },

    sync: function (url, keys) {
        var i, key, _this = this, data = {};

        keys = [].concat(this.syncKeys, keys || []);

        i = keys.length;
        while (i--) { // gather all data to sync
            key = keys[i];
            if (this.data.hasOwnProperty(key)) data[key] = this.data[key];
        }

        if (data) {
            this.syncStartEvent.notify(data);

            if (url) this.request.updateUrl(url);
            this.request.updateData(data);

            this.request.send()
                .done(function (data) {
                    if (data.type !== "fail") _this.syncKeys = [];
                    _this.syncFinishEvent.notify(data);
                })
                .fail(function () {
                    _this.syncFailEvent.notify();
                });
        }
    },

    init: function (data) {
        updateData(data, this);
    },

    on: function (event, fn) {
        switch (event) {
            case "update":
                this.updateEvent.attach(fn);
                break;
            case "delete":
                this.deleteEvent.attach(fn);
                break;
            case "syncStart":
                this.syncStartEvent.attach(fn);
                break;
            case "syncFinish":
                this.syncFinishEvent.attach(fn);
                break;
            case "syncFail":
                this.syncFailEvent.attach(fn);
                break;
        }
    },

    trigger: function (event, args) {
        switch (event) {
            case "update":
                this.updateEvent.notify(args);
                break;
            case "delete":
                this.deleteEvent.notify(args);
                break;
            case "syncStart":
                this.syncStartEvent.notify(args);
                break;
            case "syncFinish":
                this.syncFinishEvent.notify(args);
                break;
            case "syncFail":
                this.syncFailEvent.notify(args);
                break;
        }
    },

    willSync: function (key) {
        return this.syncKeys.indexOf(key) > -1;
    }
};

module.exports = Model;
