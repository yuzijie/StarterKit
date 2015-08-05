var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");
var float, alert;

var Alert = function (template, target) {
    target = target || $(document.body);
    alert = new Insert(template, target);

    alert.onInsert(function ($el) {
        float = new Floatbox($el);
        float.addListener('button[data-type="close"]', "click", function () {
            alert.destroy();
            float = null;
        });
        float.open();
    }).onDestroy(function () {
        float.close();
    });
};

Alert.prototype.show = function (data) {
    alert.insert(data);
    return this;
};
Alert.prototype.hide = function () {
    alert.destroy();
    return this;
};

Alert.prototype.changeTarget = function (target) {
    alert.changeTarget(target);
    return this;
};

module.exports = Alert;
