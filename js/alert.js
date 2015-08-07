var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");
var alert;

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Alert = function (template, target) {
    var that = this;
    this.showAction = null;

    target = target || $(document.body);
    alert = new Insert(template, target);

    alert.onInsert(function ($el) {
        if (that.showAction) that.showAction($el);

        $el.data("float", new Floatbox($el));
        $el.data("float").addListener('button[data-type="close"]', "click", function () {
            alert.destroyAll();
        });
        $el.data("float").open();

    }).onDestroy(function ($el) {
        $el.data("float").close();
    });
};

Alert.prototype.show = function (data) {
    var aid = alert.$target.data("alert-id");
    if (!$.isNumeric(aid)) {
        alert.$target.data("alert-id", alert.insert(data));
    }
    return this;
};

Alert.prototype.hide = function (target) {
    target = target || alert.$target;

    var id = to$(target).data("alert-id");
    if ($.isNumeric(id)) {
        alert.destroy(id);
        target.data("alert-id", "");
    }

    return this;
};

Alert.prototype.changeTarget = function (target) {
    alert.changeTarget(target);
    return this;
};

Alert.prototype.onShow = function (func) {
    if ($.isFunction(func)) this.showAction = func;
    return this;
};

module.exports = Alert;
