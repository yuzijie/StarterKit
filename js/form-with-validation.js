var Form = require("./form");
var Alert = require("./alert");
var tooltipTemplate = require("../templates/tooltip.hbs");

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

function getInfo($element) {
    var output = [];

    // get text
    var suggestion = $element.data("suggestion");
    var error = $element.data("validation-error");

    // error output
    if (error && error !== "required") output.push(error);
    if (suggestion) output.push(suggestion);

    // return string
    return output.join("<br>");
}

var BetterForm = function (target) {
    var that = this;
    this.self = to$(target);

    this.form = new Form(target, {
        validate: true
    });

    this.tooltip = new Alert(tooltipTemplate, target);

    // add error message
    this.form.onBlur(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        that.tooltip.hide();
    });

    this.form.onKeyup(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.getByTarget();
            if (tooltip) tooltip.html(info);
        }
    });

    this.form.onChange(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.show({text: info});
            if (tooltip) tooltip.css("left", ($el.width() - tooltip.width()) / 2 + "px");
        } else {
            that.tooltip.hide();
        }
    });

    this.form.onFocus(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        var info = getInfo($el);
        if (info) {
            var tooltip = that.tooltip.show({text: info});
            if (tooltip) tooltip.css("left", ($el.width() - tooltip.width()) / 2 + "px");
        }
    });
};

module.exports = BetterForm;
