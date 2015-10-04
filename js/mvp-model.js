var m = require("./mvp-methods"),
    h = require("./helper");

var Ev = function () {
    this.listeners = [];
    this.ids = [];
};

Ev.prototype = {
    attach: function (listener, id) {
        this.listeners.push(listener);
        this.ids.push(id);
    },
    detach: function (obj) {
        m.detach(obj, this);
    },
    notify: function (args, context) {
        m.notify(args, context, this);
    }
};

var Model = function (data) {
    if (data != null && data.constructor !== Object) throw "data must be an object!";
    this.modelId = h.r4("m");
    this.data = data || {};
    this.events = {};
    this.setList = [];
};

Model.prototype = {
    "get": function (keys) {
        return m.get(keys, this);
    },
    "pick": function (opts) {
        return m.pick(opts, this);
    },
    "one": function (key) {
        var i, obj = m.get(key, this);
        for (i in obj) if (obj.hasOwnProperty(i)) return obj[i];
    },
    "set": function (data, arg2, arg3) {
        var keys = [], desc, obj = {};

        if (data instanceof jQuery) {              // data is a jQuery form
            keys = m.setFormData(data, this);
            desc = arg2;
        } else if (data.constructor === Object) {  // data is an object
            keys = m.set(data, this);
            desc = arg2;
        } else {                                   // data is a key
            obj[data] = arg2;
            keys = m.set(obj, this);
            desc = arg3;
        }

        if (desc !== "init") h.forEach(keys, function (i, key) {
            if (this.setList.indexOf(key) === -1) this.setList.push(key);
        });

        if (keys.length) this.fire("set", {data: keys, desc: desc});
    },
    "add": function (data, desc) {
        var _this = this;
        if (data.constructor === Array) {
            h.forEach(data, function (i, item) {
                var mod = new Model(item), key;
                key = m.add(mod, _this);
                _this.fire("add", {data: key, desc: desc});
            });
        } else {
            var key = m.add(data, this);
            this.fire("add", {data: key, desc: desc});
        }
    },
    "rm": function (keys, desc) {
        var deleted = m.rm(keys, this), id = this.modelId;
        if (!h.isEmptyObj(deleted)) {
            if (this.isListening) h.forEach(deleted, function (key, obj) {
                if (obj.hasOwnProperty("modelId")) obj.off(id);
            });
            m.cleanSet(deleted, this);
            this.fire("rm", {data: deleted, desc: desc});
        }
    },
    "call": function (url, keys, opts) {
        m.call(url, keys, opts, this);
    },
    "on": function (event, fn, id) {
        if (!this.events[event]) this.events[event] = new Ev();
        this.events[event].attach(fn, id);
    },
    "off": function (id) {
        h.forEach(this.events, function (key, event) {
            event.detach(id);
        });
    },
    "fire": function (event, args) {
        if (this.events[event]) this.events[event].notify(args, this);
    },
    "is": function (desc, data) {
        this.fire("when", {data: data, desc: desc});
    },
    "listen": function (model, event, arg3, arg4) {
        var desc, fn;

        if (h.isFunction(arg3)) {    // model, event, function
            desc = void 0; // undefined
            fn = arg3;
        } else {                     // model, event, desc and function
            desc = arg3;
            fn = arg4;
        }

        this.isListening = true;

        model.on(event, function (args) {
            if (desc === args.desc) fn.call(this, args.data);
        }, this.modelId);
    },
    "size": function () {
        return h.size(this.data);
    },
    "changed": function (keys) {
        return m.changed(keys, this);
    },
    "destroy": function () {
        var id = this.modelId;
        // remove listeners
        if (this.isListening) h.forEach(this.data, function (key, obj) {
            if (obj.hasOwnProperty("modelId")) obj.off(id);
        });
        // trigger event
        this.fire("destroy", {data: id});
        // delete properties
        h.forEach(this, function (prop) {
            delete this[prop];
        });
    }
};

Model.extend = function (props) {
    return m.extend(props, this);
};

module.exports = Model;