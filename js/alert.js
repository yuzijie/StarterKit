var Insert = require("./insert.js");
var Floatbox = require("./float-box.js");
var float, alert;

var Alert = function (template) {
    alert = new Insert(template, $(document.body));
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
};
Alert.prototype.hide = function () {
    alert.destroy();
};

module.exports = Alert;
