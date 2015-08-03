var validator = require("./validator");
var scrollTo = require("./scroll-to");

var timer = null;
var validationList = [
    '[type=text]',
    '[type=email]',
    '[type=number]',
    '[type=url]',
    '[type=email]',
    '[type=password]',
    '[data-checkbox-group]',
    '[data-radio-group]',
    'textarea'
];

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Form = function (target, options) {
    // Objects
    this.self = to$(target);                                  // form
    this.$inputs = this.self.find(":input");                  // all inputs
    this.$submit = this.self.find(":submit");                 // submit button
    this.$fields = this.self.find(validationList.join(","));  // all fields need validation

    // Status
    this.allowSubmit = true;

    // Options
    this.opts = $.extend({
        validate: false
    }, options || {});

    // Actions
    this.inputFocusAction = null;
    this.inputBlurAction = null;
    this.inputChangeAction = null;
    this.keyupAction = null;
    this.submitAction = null;
    this.validateErrorAction = null;

    // set Listener
    this.setInputListener(this);
    this.setSubmitListener(this);
};

Form.prototype.setSubmitListener = function (context) {
    context = context || this;

    // on Submit
    context.self.on("submit.form", function (event) {
        var notPass = [];
        event.preventDefault();

        if (context.allowSubmit === true) {

            // validate form before submit
            if (context.opts.validate === true) {
                context.$fields.each(function () {
                    var error = context.validateForm(this);
                    if (error) notPass.push(error);
                });
            }

            // test form is valid or not
            if (notPass.length === 0) {
                context.disableSubmit();
                if (context.submitAction) context.submitAction(context.getFormUrl(), context.getPostData());
            } else {
                scrollTo(notPass[0].element.prev("label"), {
                    onFinish: function () {
                        if (context.validateErrorAction) context.validateErrorAction(notPass[0]);
                    }
                });
            }
        }
    });
};

Form.prototype.setInputListener = function (context) {
    context = context || this;

    // on Focus
    context.$inputs.on("focus.form", function () {
        if (context.inputFocusAction) context.inputFocusAction(this);
    });

    // on Blur
    context.$inputs.on("blur.form", function () {
        var validationError;
        if (context.opts.validate === true) validationError = context.validateForm(this);
        if (context.inputBlurAction) context.inputBlurAction(this, validationError);
    });

    // on Change
    context.$inputs.on("change.form", function () {
        if (context.inputChangeAction) context.inputChangeAction(this);
    });

    // on Keyup
    context.$inputs.on("keyup.form", function (event) {
        context.validateForm(this);
        if (context.keyupAction) {
            var that = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                context.keyupAction(that, event);
            }, 500);
        }
    });
};

Form.prototype.resetListener = function () {
    this.$inputs.off(".form");
    this.self.off(".form");
};

// return error if invalid
Form.prototype.validateForm = function (input) {
    var $input = to$(input);
    var validationError = validator.check($input);
    if (validationError) {
        $input.addClass("invalid-field");
    } else {
        if ($input.is(".invalid-field")) $input.removeClass("invalid-field");
    }
    return validationError;
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
