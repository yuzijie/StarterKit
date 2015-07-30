// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target) {
    this.$target = to$(target); // target to insert
    this.template = template; // template file
    this.$element = null;

    // Actions
    this.insertAction = null;
    this.destroyAction = null;
};

Insert.prototype.insert = function (data, insertMethod) {
    data = data || {};
    insertMethod = insertMethod || "append";
    this.$element = $(this.template(data));
    if (this.insertAction) this.insertAction(this.$element);
    this.$target[insertMethod](this.$element);
    return this;
};

Insert.prototype.destroy = function () {
    this.$element.remove();
    this.$element = null;
    return this;
};

Insert.prototype.onInsert = function (func) {
    if ($.isFunction(func)) this.insertAction = func;
    return this;
};

Insert.prototype.onDestroy = function () {
    if ($.isFunction(func)) this.destroyAction = func;
    return this;
};

Insert.prototype.changeTarget = function (target) {
    this.$target = to$(target); // target to insert
    return this;
};

module.exports = Insert;
