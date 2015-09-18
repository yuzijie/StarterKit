var h = require("./helper");

function forEach(obj, callback) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) callback(i, obj[i]);
    }
}

function bindEvents(type) {
    var _this = this;

    switch (type) {
        case "dom":
            if (this["domEvents"] && this.el) {
                // detach all dom events
                this.el.off();
                // attach dom events
                forEach(this["domEvents"], function (key, fn) {
                    var parts = key.split(" ");
                    _this.el.on(parts[1], parts[0], fn); // parts[1]: event, parts[0]: selector
                });
            }
            return this;
        case "model":
            if (this["modelEvents"] && this.models) {
                // detach all model events
                forEach(this.models, function (name, model) {
                    forEach(model.events, function (name, event) {
                        event.detach();
                    });
                });
                // attach model events
                forEach(this["modelEvents"], function (key, fn) {
                    var parts = key.split(" ");
                    _this.models[parts[0]].on(parts[1], fn); // parts[1]: event, parts[0]: model name
                });
            }
            return this;
    }
}

function destroy() {
    // remove dom element
    this.el.remove();
    // delete properties
    delete this.models;
    delete this.el;
    delete this.target;
}

module.exports = function (options) {
    options = options || {};

    var View = function (opts) {
        opts = opts || {};

        // model, element and target
        this.models = opts.models;
        this.el = opts.el;
        this.target = opts.target;

        // render
        if (this["render"] && !this.el) this["render"]();
        if (this.el) this.el = h.to$(this.el);

        // bind DOM and Model events
        this.bindEvents("dom").bindEvents("model");

        // initialize
        if (this.init) this.init();
    };

    View.prototype.bindEvents = bindEvents.bind(View);
    View.prototype.destroy = destroy.bind(View);

    forEach(options, function (key, item) {
        View.prototype[key] = item;
    });

    return View;
};
