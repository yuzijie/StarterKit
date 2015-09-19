var h = require("./helper");

function bindEvents(that) {
    // bind DOM events
    if (that["domEvents"] && that.el) {
        h.forEach(that["domEvents"], function (key, fn) {
            var parts = key.split(" ");
            that.el.on(parts[1], parts[0], fn); // parts[1]: event, parts[0]: selector
        });
    }
    // bind Model events
    if (that["modelEvents"] && that.models) {
        h.forEach(that["modelEvents"], function (key, fn) {
            var parts = key.split(" ");
            that.models[parts[0]].on(parts[1], fn, that.viewId); // parts[1]: event, parts[0]: model name
        });
    }
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

        // view unique id
        this.viewId = h.r8();

        // model, element and target
        this.models = opts.models;
        this.el = opts.el;
        this.target = opts.target;

        // render
        if (this["render"] && !this.el) this["render"]();
        if (this.el) this.el = h.to$(this.el);

        // bind DOM and Model events
        bindEvents(this);

        // initialize
        if (this.init) this.init();
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
