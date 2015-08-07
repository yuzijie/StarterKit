var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");

// helper functions
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var alert;

var Alert = function (template, target) {
    var that = this;
    target = target || $(document.body);

    // custom action
    this.showAction = null;

    // new Insert Object
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
        aid =  alert.insert(data);
        alert.$target.data("alert-id", aid);
        return alert.$elements[aid];
    }
    return null;
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

Alert.prototype.changeContent = function (data, target) {
    target = target || alert.$target;
    var id = to$(target).data("alert-id");
    if ($.isNumeric(id)) alert.changeContent(data, id);
    return this;
};

Alert.prototype.onShow = function (func) {
    if ($.isFunction(func)) this.showAction = func;
    return this;
};

module.exports = Alert;
