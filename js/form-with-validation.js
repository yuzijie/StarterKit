var Form = require("./form");
var Alert = require("./alert");
var tooltipTemplate = require("../templates/tooltip.hbs");

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var BetterForm = function (target) {
    var that = this;
    this.self = to$(target);

    this.form = new Form(target, {
        validate: true
    });

    this.tooltip = new Alert(tooltipTemplate, target);

    this.form.onFocus(function (e) {
        var $el = $(e.target);
        if ($el.data("validation-error")) {
            that.tooltip.changeTarget($el.prev("label"));
            that.tooltip.show({text: $el.data("validation-error")});
        }
    });

    //this.form.onBlur(function () {
    //    that.tooltip.hide();
    //});
};

module.exports = BetterForm;
