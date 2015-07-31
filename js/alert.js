//var Insert = require("./insert.js");
var alertTemplate = require("../templates/alert.hbs");
var Floatbox = require("./float-box.js");

//var Alert = function (innerTemplate) {
//    var that = this;
//    var floatbox;
//
//    this.innerTemplate = innerTemplate;
//    this.self = new Insert(alertTemplate, $(document.body));
//    this.self.onInsert(function ($el) {
//        floatbox = new Floatbox($el);
//        var inner = $el.children(".inner");
//        // how to insert html into insert?
//        floatbox.onClose(function () {
//            that.self.destroy();
//        });
//        floatbox.open();
//    });
//    this.self.onDestroy(function(){
//        floatbox.close();
//        floatbox = null;
//    });
//};
//
//Alert.prototype.show = function (data) {
//    var content = this.innerTemplate(data);
//    this.self.insert();
//};
//
//Alert.prototype.hide = function () {
//    this.self.destroy();
//};
//
//module.exports = Alert;


var Alert = function (template) {
    this.template = template || null;
    this.alert = null;
    this.floatbox = null;
};

Alert.prototype.show = function (data) {
    var that = this;
    if (this.template) {
        data = this.template(data);
    }
    var alertContainer = $(alertTemplate());
    this.alert = alertContainer.children(".inner").html(data);
    this.floatbox = new Floatbox(this.alert);
    this.alert.find('button[data-type="close"]').click(function (e) {
        e.preventDefault();
        that.floatbox.close();
    });
    this.floatbox.onClose(function () {
        that.alert.remove();
        that.alert = null;
    });
};

module.exports = Alert;
