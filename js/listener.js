// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Listener = function (namespace) {
    this.namespace = namespace || "";
    this.listeners = [];
};

Listener.prototype.add = function (target, event, func) {
    target = to$(target);
    event = event + "." + this.namespace;

    if (target.length > 0 && $.isFunction(func)) {
        var listener = {target: target, event: event, execute: func};
        this.listeners.push(listener);
    }
    return this;
};

Listener.prototype.on = function () {
    $.each(this.listeners, function (index, item) {
        item.target.on(item.event, function (e) {
            e.preventDefault();
            item.execute(e);
        });
    });
    return this;
};

Listener.prototype.off = function () {
    $.each(this.listeners, function(index, item){
        item.target.off(item.event);
    });
    return this;
};

Listener.prototype.remove = function () {
    this.off().listeners = [];
    return this;
};

module.exports = Listener;
