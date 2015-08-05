// 注明：只有在需要频繁开启和关闭 listeners 的时候才需要这个库
// 否则直接使用 jQuery 的 on 即可

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Listener = function (namespace, parent) {
    this.parent = (parent) ? to$(parent) : null;
    this.namespace = (namespace) ? "." + namespace : "";
    this.listeners = [];
};

// 1: target, event, func
// 2: event, func
Listener.prototype.add = function () {
    var target, event, func;

    switch (arguments.length) {
        case 2:
            if (!this.parent) throw "no target element for listener!";
            target = this.parent;
            event = arguments[0] + this.namespace;
            func = arguments[1];
            break;
        case 3:
            if (this.parent) {
                target = this.parent.find(arguments[0]);
            } else {
                target = to$(arguments[0]);
            }
            event = arguments[1] + this.namespace;
            func = arguments[2];
            break;
    }

    if (target.length > 0) {
        var listener = {target: target, event: event, execute: func};
        this.listeners.push(listener);
    }
    return this;
};

Listener.prototype.on = function () {
    $.each(this.listeners, function (index, item) {
        item.target.on(item.event, function (e) {
            item.execute.call(this, e);
        });
    });
    return this;
};

Listener.prototype.off = function () {
    $.each(this.listeners, function (index, item) {
        item.target.off(item.event);
    });
    return this;
};

Listener.prototype.remove = function () {
    this.off().listeners = [];
    return this;
};

module.exports = Listener;
