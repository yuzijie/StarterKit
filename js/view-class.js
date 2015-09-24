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
            var parts = key.split(" ", 3);
            fn = that[fn].bind(that);
            that.models[parts[0]].on(parts[1], function (args) { // parts[1]: event, parts[0]: model name, parts[2]: desc
                if (!parts[2] || parts[2] === args.desc) fn(args.data);
            }, that.viewId);
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

// format data into human readable array
function formatData(model, that) {
    var form = that.el;

    var serializeArray = form.serializeArray(),
        output = {};

    $.each(serializeArray, function (key, item) {
        var l = item.name.length;
        if (item.name.indexOf("[]", l - 2) !== -1) {
            var name = item.name.substring(0, l - 2);
            if (!output[name]) output[name] = [];
            output[name].push(item.value);
        } else {
            output[item.name] = item.value;
        }
    });

    model.set(output);
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

        // bind Dom events
        bindDomEvents(this);

        // initialize
        if (this.init) this.init();
    };

    View.prototype.render = function (model) {
        return render(model, this);
    };

    View.prototype.destroy = function () {
        destroy(this);
    };

    View.prototype.setFormData = function (model) {
        formatData(model, this);
    };

    options = options || {};

    h.forEach(options, function (key, item) {
        View.prototype[key] = item;
    });

    return View;
};
