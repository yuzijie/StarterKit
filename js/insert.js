// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target, options) {
    this.$target = to$(target); // target to insert
    this.template = template; // template file
    this.$elements = [];

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
    var $element = $(this.template(data));
    this.$target[this.opts.insertMethod]($element);
    if (this.insertAction) this.insertAction($element);
    this.$elements.push($element);
    return this;
};

Insert.prototype.destroy = function () {
    if (this.$elements.length > 0) {
        var $element = this.$elements.pop();
        if (this.destroyAction) this.destroyAction($element);
        $element.remove();
    }
    return this;
};

Insert.prototype.destroyAll = function () {
    if (this.$elements.length > 0) {
        if (this.destroyAction) this.destroyAction(this.$elements);
        $.each(this.$elements, function (index, $element) {
            $element.remove();
        });
        this.$elements = [];
    }
    return this;
};

Insert.prototype.reinsert = function (data) {
    this.destroy().insert(data);
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
