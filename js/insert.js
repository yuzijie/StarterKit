// Insert.js 唯一用到的场合，是当一系列 DOM 元素需要频繁添加或删除的时候

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Insert = function (template, target, insertMethod) {
    this.$target = to$(target);                   // target to insert
    this.template = template;                     // template file
    this.insertMethod = insertMethod || "append"; // insert method
    this.$elements = [];                          // inserted elements

    // Actions
    this.insertAction = null;
    this.destroyAction = null;
};

Insert.prototype.insert = function (data) {
    data = data || {};
    var $element = $(this.template(data));

    // add to DOM
    this.$target[this.insertMethod]($element);

    // add to Array
    var index = this.$elements.indexOf(null);
    if (index > -1) {
        this.$elements[index] = $element;
    } else {
        index = this.$elements.push($element) - 1;
    }

    // custom action
    if (this.insertAction) this.insertAction($element);
    return index;
};

Insert.prototype.destroy = function (index) {
    var length = this.$elements.length;

    if (length > 0) {
        var $element = null;

        if ($.isNumeric(index) && index < length - 1) {
            $element = this.$elements[index];
            if ($element) this.$elements[index] = null;
        } else {
            $element = this.$elements.pop();
        }

        if ($element) {
            if (this.destroyAction) this.destroyAction($element);
            $element.remove();
            return true;
        } else {
            return false;
        }
    }
    return false;
};

Insert.prototype.destroyAll = function () {
    var length = this.$elements.length;

    if (length > 0) {

        length = 0;

        // custom action
        if (this.destroyAction) this.destroyAction(this.$elements);

        // remove all
        $.each(this.$elements, function (index, $element) {
            if ($element) {
                $element.remove();
                length += 1;
            }
        });

        // clear array
        this.$elements = [];
    }

    return length;
};

Insert.prototype.reinsert = function (data, id) {
    this.destroy(id);
    return this.insert(data);
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
