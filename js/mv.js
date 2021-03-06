var h = require("./helper"), XHR = require("./xhr");
var splitter = /\s+/;

//////////////// Event ////////////////
var Ev = function () {
    this.listeners = [];
    this.ids = [];
};

Ev.prototype = {
    attach: function (listener, id) {
        this.listeners.push(listener);
        this.ids.push(id);
    },
    detach: function (obj) { // detach by listener or id
        var that = this;
        if (!obj) {
            that.listeners = [];
        } else if (obj instanceof Function) { // if object is a listener
            h.forEach(that.listeners, function (i, listener) {
                if (obj === listener) {
                    that.listeners.splice(i, 1);
                    that.ids.splice(i, 1);
                }
            });
        } else { // else treat object as an id
            h.forEach(that.ids, function (i, id) {
                if (obj === id) {
                    that.listeners.splice(i, 1);
                    that.ids.splice(i, 1);
                }
            });
        }
    },
    notify: function (args, context) {
        h.forEach(this.listeners, function (i, listener) {
            listener.call(context, args);
        });
    }
};

//////////////// Model ////////////////
var Model = function (data) {
    if (data != null && data.constructor !== Object) throw "Model data must be an object!";
    var tmp = {};

    if (this['defaults']) h.forEach(this['defaults'], function (key, value) {
        tmp[key] = value;
    });

    if (data) h.forEach(data, function (key, value) {
        tmp[key] = value;
    });

    this.data = tmp;
    this.modelId = this.modelId || h.r4("M");
    this.events = {};
    this.setList = [];

    if (this.init) this.init();
};

Model.prototype = {
    "get": function (keys) {
        var output = {}, that = this;

        if (keys == null) {
            output = that.data;
        } else {
            if (keys.constructor !== Array) keys = (keys + "").split(splitter);
            h.forEach(keys, function (i, key) {
                if (that.data.hasOwnProperty(key)) output[key] = that.data[key];
            });
        }

        return output;
    },

    "one": function (key) {
        var i, obj = this.get(key);
        for (i in obj) if (obj.hasOwnProperty(i)) return obj[i];
    },

    "set": function (key, value, desc) {
        var old, obj = {}, d = this.data, l = this.setList;

        if (key.charAt) { // key, value, desc
            obj[key] = value;
            old = _set(obj, d);
        } else { // obj, desc
            desc = value;
            old = (key instanceof jQuery) ? _setFormData(key, d) : _set(key, d);
        }

        if (!desc || !desc.charAt || desc.charAt(0) !== "_") h.forEach(old, function (i) {
            if (l.indexOf(i) === -1) l.push(i);
        });

        if (!h.isEmptyObj(old)) this.fire("set", {data: old, desc: desc, model: this});
    },

    "rm": function (keys, desc) {
        var deleted = _rm(keys, this.data);

        if (!h.isEmptyObj(deleted)) {
            this.setList = _restOf(this.setList, deleted);
            this.fire("rm", {data: deleted, desc: desc, model: this});
        }
    },

    "call": function (url, keys, opts) {
        var obj;

        if (opts == null) { // url, opts, undefined
            obj = null;
            opts = keys;
        } else {
            if (keys === void 0) keys = null;
            obj = (typeof keys === "object") ? keys : this.get(keys);
        }

        _call(url, obj, opts, this);
    },

    "save": function (url, keys, opts) {
        if (opts == null) { // url, opts, undefined
            opts = keys;
            keys = null;
        }

        _call(url, this.changed(keys), opts, this);
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

    "exec": function (desc, data) {
        this.fire("when", {data: data, desc: desc, model: this});
    },

    "changed": function (keys) {
        return _changed(keys, this);
    },

    "destroy": function () {
        var id = this.modelId, _this = this;

        // trigger event
        this.fire("destroy", {data: id, model: _this});

        // delete properties
        h.forEach(_this, function (prop) {
            delete _this[prop];
        });
    }
};

Model.extend = function (props) {
    return _extend(props, this);
};

//////////////// View /////////////////
var View = function (opts) {
    opts = opts || {};
    var _this = this, el, models;

    if (this.models) models = this.models; // get parent models

    h.forEach(opts, function (key, item) {
        _this[key] = item;
    });

    // prepare element
    if (el = this.el) {
        if (el.charAt) el = document.createElement(el); // el is a string
        this.el = h.to$(el);
        if (this.attr) this.el.attr(this.attr);
    }

    // inherent parent models
    this.models = this.models || {};

    if (models) h.forEach(models, function (name, model) {
        if (!_this.models.hasOwnProperty(name)) _this.models[name] = model;
    });

    // attach destroy event
    h.forEach(this.models, function (name) {
        _this.listen(name, "destroy", function () {
            _rm(name, _this.models);
        });
    });

    this.viewId = this.viewId || h.r4("V");

    _bindModelEvents(this);
    _bindDomEvents(this);

    if (this.init) this.init();
};

View.prototype = {
    "render": function (model) {
        if (!!model && model.charAt) model = this.models[model];
        return _render(model, this);
    },

    "listen": function (modelName, event, desc, fn) {
        var model = this.models[modelName];
        if (model) {
            _listen(model, event, desc, fn, this);
        } else throw "model not found";
    },

    "pick": function (opts) {
        return _pick(opts, this);
    },

    "call": function (url, obj, opts) {
        if (opts == null) { // url, opts, undefined
            opts = obj;
            obj = null;
        }

        _call(url, obj, opts, this);
    },

    "add": function (model, name) {
        var key, _this = this;

        if (model != null && model.hasOwnProperty("modelId")) {
            key = name || model.modelId;
            if (this.models[key]) throw "Model already exists";

            this.models[key] = model;

            this.listen(key, "destroy", function () {
                _rm(key, _this.models);
            });
        } else throw "Invalid model!";

        return key;
    },

    "rm": function (keys) {
        var rm = _rm(keys, this.models), id = this.viewId;

        // detach all events
        h.forEach(rm, function (i, model) {
            model.off(id);
        });

        return rm;
    },

    "destroy": function () {
        var id = this.viewId, _this = this;

        // remove dom element
        if (this.el) this.el.remove();

        // remove listeners
        if (this.models) h.forEach(this.models, function (key, obj) {
            obj.off(id);
        });

        // delete properties
        h.forEach(_this, function (prop) {
            delete _this[prop];
        });
    },

    "size": function () {
        return h.size(this.models);
    }
};

View.extend = function (props) {
    return _extend(props, this);
};

/////////////// Methods ///////////////
function _pick(opts, that) {
    opts = opts || {};

    var output = [], item;

    if (opts.filter) {
        h.forEach(that.models, function (key, value) {
            item = opts.filter(key, value);
            if (item) output.push(item);
        });
    } else {
        h.forEach(that.models, function (key, value) {
            output.push(value);
        });
    }

    if (opts.sort) output.sort(opts.sort);
    if (opts.reverse === true) output.reverse();

    return output;
}

function _set(data, obj) {
    var old = {};

    if (typeof data === 'object' && !!data) {
        h.forEach(data, function (key, value) {
            if (obj[key] === value) return;
            old[key] = obj[key];
            obj[key] = value;
        });
    } else throw "Invalid data!";

    return old;
}

function _setFormData(form, obj) {
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

    return _set(output, obj);
}

function _rm(keys, obj) {
    var rm = {};

    if (keys == null) { // remove all
        rm = obj;
        obj = {};
    } else {
        if (keys.constructor !== Array) keys = (keys + "").split(splitter);
        h.forEach(keys, function (i, key) {
            if (obj.hasOwnProperty(key)) {
                rm[key] = obj[key];
                delete obj[key];
            }
        });
    }

    return rm;
}

function _call(url, obj, opts, that) {
    if (h.isEmptyObj(obj)) obj = null;

    if (that.hasOwnProperty("xhr")) {
        that.xhr.updateUrl(url).updateData(obj);
    } else {
        that.xhr = new XHR(url, obj);
    }

    that.xhr.send().done(function (data) {
        if (obj && data.type === "success") that.setList = _restOf(that.setList, obj);
        if (opts[data.type]) opts[data.type].call(that, data);
    }).fail(function () {
        if (opts["error"]) opts["error"].call(that);
    });
}

function _restOf(list, obj) {
    var tmp = [];
    h.forEach(list, function (i, key) {
        if (!obj.hasOwnProperty(key)) tmp.push(key);
    });
    return tmp;
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

function _bindModelEvents(that) {
    var events = that['modelEvents'], p;

    if (events) h.forEach(events, function (key, fn) {
        if (!h.isFunction(fn)) fn = that[fn];
        p = key.split(splitter, 3);
        that.listen(p[0], p[1], p[2], fn); // 0: modelName, 1: event, 2: desc
    });
}

function _bindDomEvents(that) {
    if (that["domEvents"]) h.forEach(that["domEvents"], function (key, fn) {
        if (!h.isFunction(fn)) fn = that[fn];
        var parts = key.split(splitter, 2);

        if (parts[0] === "this") {
            that.el.on(parts[1], function (e) { // 1: event
                fn.call(that, e, this);
            });
        } else {
            that.el.on(parts[1], parts[0], function (e) { // 1: event, 0: selector
                fn.call(that, e, this);
            });
        }
    });
}

function _render(model, that) {
    var output;

    if (model) {
        output = that.template(model.get());
    } else {
        output = that.template();
    }

    that.el.html(output);

    return that.el;
}

function _listen(model, event, desc, fn, that) {
    if (fn == null) {   // model, event, function
        fn = desc;
        desc = void 0;
    }

    model.on(event, function (args) {
        if (desc === args.desc) fn.call(that, args.data, args.model);
    }, that.viewId);
}

///////////// Inheritance /////////////
function _extend(props, that) {
    var parent = that, Extend;

    Extend = function () {
        parent.apply(this, arguments);
    };

    Extend.prototype = Object.create(parent.prototype); // inherit

    if (props) h.forEach(props, function (key, value) {
        Extend.prototype[key] = value;
    });

    Extend.prototype.constructor = Extend;

    return Extend;
}

module.exports = {
    Model: Model,
    View: View
};