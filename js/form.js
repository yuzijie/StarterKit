var validator = require("./validator");
var Listener = require("./listener");

var timer = null;
var validationList = [
    '[type=text]',
    '[type=email]',
    '[type=number]',
    '[type=url]',
    '[type=email]',
    '[type=password]',
    '[data-input-group]',
    'textarea'
];

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

// Form.js
var Form = function (target, options) {

    // Options
    this.opts = $.extend({
        validate: false
    }, options || {});

    // Objects
    this.self = to$(target);                   // the form
    this.$inputs = this.self.find(":input");   // all inputs
    this.$submit = this.self.find(":submit");  // submit button
    if (this.opts.validate === true) {
        this.$fields = this.self.find(validationList.join(","));  // all fields need validation
    }

    // Status
    this.allowSubmit = true;

    // Actions
    this.inputFocusAction = null;
    this.inputBlurAction = null;
    this.inputChangeAction = null;
    this.keyupAction = null;
    this.submitAction = null;
    this.validateErrorAction = null;

    // set Listener
    this.listeners = new Listener("form");
    this.setListeners();
};

Form.prototype.addSubmitListener = function () {
    var that = this;

    this.listeners.add(this.self, "submit", function (e) {
        e.preventDefault();
        var invalidElement = null;

        // if allow submit
        if (that.allowSubmit === true) {

            // validate
            if (that.opts.validate === true) {
                that.$fields.each(function () {
                    var errorMessage = that.validateForm(this);
                    if (errorMessage && !invalidElement) invalidElement = this;
                });
            }

            // test whether to submit
            if (invalidElement) {
                if (that.validateErrorAction) that.validateErrorAction(invalidElement);
            } else {
                that.disableSubmit();
                if (that.submitAction) that.submitAction(that.getFormUrl(), that.getPostData());
            }
        }
    });

    return this;
};

Form.prototype.addInputListener = function () {
    var that = this;

    // on Focus
    this.listeners.add(this.$inputs, "focus", function (e) {
        if (that.inputFocusAction) that.inputFocusAction(e);
    });

    // on Blur
    this.listeners.add(this.$inputs, "blur", function (e) {
        if (that.inputBlurAction) that.inputBlurAction(e);
    });

    // on Change
    this.listeners.add(this.$inputs, "change", function (e) {
        if (that.opts.validate === true) {
            var $target = $(e.target);
            if ($target.is(":checkbox, :radio")) $target = $target.closest("[data-input-group]");
            that.validateForm($target);
        }
        if (that.inputChangeAction) that.inputChangeAction(e);
    });

    // on Keyup
    this.listeners.add(this.$inputs, "keyup", function (e) {
        if (that.keyupAction) {
            var context = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                that.keyupAction.call(context, e);
            }, 500);
        }
    });

    // fix number input problem
    this.listeners.add(this.$inputs.filter("[type=number]"), "keypress", function (e) {
        if (e.which < 48 || e.which > 57) e.preventDefault();
    });

    return this;
};

Form.prototype.setListeners = function () {
    this.addSubmitListener().addInputListener();
    this.listeners.on();
    return this;
};

Form.prototype.resetListeners = function () {
    this.listeners.remove();
    return this;
};

// return error if invalid
Form.prototype.validateForm = function (input) {
    var $input = to$(input);
    var errorMessage = validator.check($input);
    $input.data("validation-error", errorMessage);
    if (errorMessage) {
        $input.addClass("invalid-field");
    } else {
        if ($input.is(".invalid-field")) $input.removeClass("invalid-field");
    }
    return errorMessage;
};

Form.prototype.buttonText = function (text) {
    if (this.$submit.is("button")) {
        this.$submit.text(text);
    } else {
        this.$submit.val(text);
    }
};

Form.prototype.enableSubmit = function () {
    this.$submit.prop("disabled", false);
    this.allowSubmit = true;
    return this;
};

Form.prototype.disableSubmit = function () {
    this.$submit.prop("disabled", true);
    this.allowSubmit = false;
    return this;
};

// Functions
Form.prototype.onFocus = function (func) {
    if ($.isFunction(func)) this.inputFocusAction = func;
    return this;
};

Form.prototype.onBlur = function (func) {
    if ($.isFunction(func)) this.inputBlurAction = func;
    return this;
};

Form.prototype.onChange = function (func) {
    if ($.isFunction(func)) this.inputChangeAction = func;
    return this;
};

Form.prototype.onKeyup = function (func) {
    if ($.isFunction(func)) this.keyupAction = func;
    return this;
};

Form.prototype.onSubmit = function (func) {
    if ($.isFunction(func)) this.submitAction = func;
    return this;
};

Form.prototype.onValidateError = function (func) {
    if ($.isFunction(func)) this.validateErrorAction = func;
    return this;
};

Form.prototype.getData = function () {
    var serializeArray = this.self.serializeArray();
    var output = {};
    $.each(serializeArray, function (key, item) {
        var l = item.name.length;
        if (item.name.indexOf("[]", l - 2) !== -1) {
            var name = item.name.substring(0, l - 2);
            if (!output[name]) output[name] = [];
            output[name].push(item.value);
        } else {
            output[item.name] = item.value;
        }
    });
    return output;
};

Form.prototype.getPostData = function () {
    return this.self.serialize();
};

Form.prototype.getFormUrl = function () {
    return this.self.attr("action");
};

module.exports = Form;
