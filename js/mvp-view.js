var m = require("./mvp-methods"),
    h = require("./helper");

var View = function (opts) {
    opts = opts || {};

    var _this = this;

    h.forEach(opts, function (key, item) {
        _this[key] = item;
    });

    if (!this.viewId) this.viewId = h.r4("v");
    if (!this.models) this.models = {};

    m.bindModelEvents(this);
    m.bindDomEvents(this);

    if (this.init) this.init();
};

View.prototype = {
    "render": function (model) {
        return m.render(model, this);
    },
    "destroy": function () {
        m.destroy(this);
    }
};

View.extend = function (props) {
    return m.extend(props, this);
};

module.exports = View;