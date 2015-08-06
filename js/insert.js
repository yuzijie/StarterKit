// Insert.js 唯一用到的场合，是当一系列 DOM 元素需要频繁添加或删除的时候

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target, insertMethod) {
    this.$target = to$(target);                   // target to insert
    this.template = template;                     // template file
    this.insertMethod = insertMethod || "append"; // insert method
    this.$elements = [];

    // Actions
    this.insertAction = null;
    this.destroyAction = null;
};

Insert.prototype.insert = function (data) {
    data = data || {};
    var $element = $(this.template(data));

    // add to DOM
    this.$target[this.insertMethod]($element);
    this.$elements.push($element);

    // custom action
    if (this.insertAction) this.insertAction($element);
    return this;
};

Insert.prototype.destroy = function () {
    if (this.$elements.length > 0) {
        var $element = this.$elements.pop();

        // custom action
        if (this.destroyAction) this.destroyAction($element);

        // remove from DOM
        $element.remove();
    }
    return this;
};

Insert.prototype.destroyAll = function () {
    if (this.$elements.length > 0) {

        // custom action
        if (this.destroyAction) this.destroyAction(this.$elements);

        // remove all
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

Insert.prototype.changeMethod = function (method) {
    if (typeof method === "string") this.insertMethod = method;
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
