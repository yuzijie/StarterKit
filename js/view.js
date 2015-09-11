var h = require("./helper");

module.exports.extend = function (options) {
    var i;
    options = options || {};

    var View = function (opts) {
        opts = opts || {};

        // model
        this.models = opts.models || null;

        // element
        this.element = opts.element || null;

        // target
        this.target = opts.target || null;

        // render
        if (this.render && !this.element) this.render();
        if (this.element) this.element = h.to$(this.element);

        // initialize
        if (this.init) this.init();
    };

    for (i in options) {
        if (options.hasOwnProperty(i) && h.isFunction(options[i])) {
            View.prototype[i] = options[i];
        }
    }

    return View;
};
