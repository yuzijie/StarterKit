var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");
var float, alert;

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

        float = new Floatbox($el);
        float.addListener('button[data-type="close"]', "click", function () {
            alert.destroyAll();
            float = null;
        });
        float.open();

    }).onDestroy(function () {
        float.close();
    });
};

Alert.prototype.show = function (data) {
    var aid = alert.$target.data("alert-id");
    if (!aid && aid !== 0) {
        alert.$target.data("alert-id", alert.insert(data));
    }
    return this;
};

Alert.prototype.hide = function (target) {
    target = target || alert.$target;

    var id = to$(target).data("alert-id");
    if (id || id === 0) {
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
