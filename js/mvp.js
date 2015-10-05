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
    detach: function (obj) {
        _detach(obj, this);
    },
    notify: function (args, context) {
        _notify(args, context, this);
    }
};
/////// Event Methods ////////
function _detach(obj, that) { // detach by listener or id
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
}

function _notify(args, context, that) {
    h.forEach(that.listeners, function (i, listener) {
        listener.call(context, args);
    });
}

//////////////// Model ////////////////
var Model = function (data) {
    if (data != null && data.constructor !== Object) throw "data must be an object!";

    this.modelId = h.r4("M");
    this.data = data || {};
    this.events = {};
    this.setList = [];

    if (this.init) this.init();
};

Model.prototype = {
    "get": function (keys) {
        return _get(keys, this);
    },

    "pick": function (opts) {
        return _pick(opts, this);
    },

    "one": function (key) {
        var i, obj = _get(key, this);
        for (i in obj) if (obj.hasOwnProperty(i)) return obj[i];
    },

    "set": function (data, arg2, arg3) {
        var keys = [], desc, obj = {}, _this = this;

        if (data instanceof jQuery) {              // data is a jQuery form
            keys = _setFormData(data, this);
            desc = arg2;
        } else if (data.constructor === Object) {  // data is an object
            keys = _set(data, this);
            desc = arg2;
        } else {                                   // data is a key
            obj[data] = arg2;
            keys = _set(obj, this);
            desc = arg3;
        }

        if (desc !== "init") h.forEach(keys, function (i, key) {
            if (_this.setList.indexOf(key) === -1) _this.setList.push(key);
        });

        if (keys.length) this.fire("set", {data: keys, desc: desc});
    },

    "add": function (data, desc) {
        var _this = this;
        if (data.constructor === Array) {
            h.forEach(data, function (i, item) {
                var mod = new Model(item), key;
                key = _add(mod, _this);
                _this.fire("add", {data: key, desc: desc});
            });
        } else {
            var key = _add(data, this);
            this.fire("add", {data: key, desc: desc});
        }
    },

    "rm": function (keys, desc) {
        var deleted = _rm(keys, this), id = this.modelId;
        if (!h.isEmptyObj(deleted)) {
            if (this.isListening) h.forEach(deleted, function (key, obj) {
                if (obj.hasOwnProperty("modelId")) obj.off(id);
            });
            _cleanSet(deleted, this);
            this.fire("rm", {data: deleted, desc: desc});
        }
    },

    "call": function (url, keys, opts) {
        _call(url, keys, opts, this);
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
        var id = model.modelId;

        if (!this.models) this.models = {};
        if (!this.models[id]) this.models[id] = model;

        _listen(model, event, arg3, arg4, this, this.modelId);
    },

    "size": function () {
        return h.size(this.data);
    },

    "changed": function (keys) {
        return _changed(keys, this);
    },

    "destroy": function () {
        var id = this.modelId, _this = this;
        // remove listeners
        if (this.models) h.forEach(this.models, function (key, obj) {
            obj.off(id);
        });
        // trigger event
        this.fire("destroy", {data: id});
        // delete properties
        h.forEach(_this, function (prop) {
            delete _this[prop];
        });
    }
};

Model.extend = function (props) {
    return _extend(props, this);
};

/////// Model Methods ////////
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
    } else if (keys.constructor === Object) {
        obj = keys;
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

//////////////// View /////////////////
var View = function (opts) {
    opts = opts || {};

    var _this = this;

    h.forEach(opts, function (key, item) {
        _this[key] = item;
    });

    if (!this.viewId) this.viewId = h.r4("V");

    _bindModelEvents(this);
    _bindDomEvents(this);

    if (this.init) this.init();
};

View.prototype = {
    "render": function (model) {
        return _render(model, this);
    },

    "listen": function (modelName, event, arg3, arg4) {
        var model = this.models[modelName];
        if (!model) throw "invalid model name";

        _listen(model, event, arg3, arg4, this, this.viewId);
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
    }
};

View.extend = function (props) {
    return _extend(props, this);
};

//////// View Methods ////////
function _bindModelEvents(that) {
    if (that["modelEvents"] && that.models) h.forEach(that["modelEvents"], function (key, fn) {
        if (!h.isFunction(fn)) fn = that[fn];
        var parts = key.split(splitter, 3);

        that.models[parts[0]].on(parts[1], function (args) { // [0]: model name, [1]: event
            if (parts[2] === args.desc) fn.call(that, args.data); // [2]: desc
        }, that.viewId);
    });
}

function _bindDomEvents(that) {
    if (that["domEvents"] && that.el) h.forEach(that["domEvents"], function (key, fn) {
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

/// View and Model Methods ///
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

//// Inheritance Methods /////
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
    Model: Model,
    View: View
};