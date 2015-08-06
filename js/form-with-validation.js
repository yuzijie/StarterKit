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

    // add error message
    this.form.onChange(function (e, context) {
        var $el = $(context);
        that.tooltip.changeTarget($el.prev("label"));
        if ($el.data("validation-error")) {
            that.tooltip.onShow(function ($tt) {
                if ($el.offset().top - $(window).scrollTop() <= $tt.outerHeight()) {
                    $tt.css({
                        bottom: ($el.outerHeight() + $tt.outerHeight() + 20) * -1 + "px",
                        left: ($el.width() - $tt.width()) / 2 + "px"
                    }).addClass("reverse");
                } else {
                    $tt.css({
                        bottom: "8px",
                        left: ($el.width() - $tt.width()) / 2 + "px"
                    });
                }
            });
            that.tooltip.show({text: $el.data("validation-error")});
        } else {
            that.tooltip.hide();
        }
    });
};

module.exports = BetterForm;
