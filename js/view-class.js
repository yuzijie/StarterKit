var h = require("./helper");

function bindDomEvents(that) {
    if (that["domEvents"] && that.el) {
        h.forEach(that["domEvents"], function (key, fn) {
            var parts = key.split(" ");
            fn = that[fn].bind(that);
            that.el.on(parts[1], parts[0], fn); // parts[1]: event, parts[0]: selector
        });
    }
}

function bindModelEvents(that) {
    if (that["modelEvents"] && that.models) {
        h.forEach(that["modelEvents"], function (key, fn) {
            var parts = key.split(" ");
            fn = that[fn].bind(that);
            that.models[parts[0]].on(parts[1], fn, that.viewId); // parts[1]: event, parts[0]: model name
        });
    }
}

function render(model, that) {
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
        bindDomEvents(that);
    }
    return that;
}

function destroy(that) {

    // remove dom element
    if (that.el) that.el.remove();

    // remove model listeners
    if (that.models) h.forEach(that.models, function (key, model) {
        model.off(that.viewId);
    });

    // delete properties
    delete that.models;
    delete that.el;
    delete that.target;
}

module.exports = function (options) {

    var View = function (opts) {
        opts = opts || {};

        this.models = opts.models || {};

        this.viewId = opts.viewId || h.r8();

        if (opts.el) this.el = opts.el;
        if (opts.target) this.target = opts.target;

        // bind Model events
        bindModelEvents(this);

        // initialize
        if (this.init) this.init();
    };

    View.prototype.render = function (data) {
        return render(data, this);
    };

    View.prototype.destroy = function () {
        destroy(this);
    };

    options = options || {};

    h.forEach(options, function (key, item) {
        View.prototype[key] = item;
    });

    return View;
};
