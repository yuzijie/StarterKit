// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target, options) {
    this.$target = to$(target); // target to insert
    this.template = template; // template file
    this.$element = null;

    // Options
    this.opts = $.extend({
        insertMethod: "append"
    }, options || {});

    // Actions
    this.insertAction = null;
    this.destroyAction = null;
};

Insert.prototype.insert = function (data) {
    data = data || {};
    this.$element = $(this.template(data));
    if (this.insertAction) this.insertAction(this.$element);
    this.$target[this.opts.insertMethod](this.$element);
    return this;
};

Insert.prototype.destroy = function () {
    if (this.$element) {
        if (this.destroyAction) this.destroyAction(this.$element);
        this.$element.remove();
        this.$element = null;
    }
    return this;
};

Insert.prototype.reinsert = function (data) {
    this.destroy();
    this.insert(data);
    return this;
};

Insert.prototype.changeTarget = function (target) {
    this.$target = to$(target); // target to insert
    return this;
};

Insert.prototype.changeTemplate = function (template) {
    this.template = template;
    return this;
};

Insert.prototype.onInsert = function (func) {
    if ($.isFunction(func)) this.insertAction = func;
    return this;
};

Insert.prototype.onDestroy = function (func) {
    if ($.isFunction(func)) this.destroyAction = func;
    return this;
};

module.exports = Insert;
