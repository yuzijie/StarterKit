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
    '[data-input-group]',
    'textarea'
];

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Form = function (target, options) {
    // Options
    this.opts = $.extend({
        validate: false
    }, options || {});

    // Objects
    this.self = to$(target);                   // form
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
    this.setInputListener(this);
    this.setSubmitListener(this);
};

Form.prototype.setSubmitListener = function (context) {
    var that = context || this;

    // on Submit
    that.self.on("submit.form", function (event) {
        var notPass = [];
        event.preventDefault();

        if (that.allowSubmit === true) {

            if (that.opts.validate === true) { // validate form
                that.$fields.each(function () {
                    var error = that.validateForm(this);
                    if (error) notPass.push(error);
                });
            }

            // test whether form is valid or not
            if (notPass.length === 0) {
                that.disableSubmit();
                if (that.submitAction) that.submitAction(that.getFormUrl(), that.getPostData());
            } else {
                scrollTo(notPass[0].element.prev("label"), {
                    onFinish: function () {
                        if (that.validateErrorAction) that.validateErrorAction(notPass[0]);
                    }
                });
            }
        }
    });
};

Form.prototype.setInputListener = function (context) {
    var that = context || this;

    // on Focus
    that.$inputs.on("focus.form", function () {
        if (that.inputFocusAction) that.inputFocusAction(this);
    });

    // on Blur
    that.$inputs.on("blur.form", function () {
        if (that.inputBlurAction) that.inputBlurAction(this);
    });

    // on Change
    that.$inputs.on("change.form", function () {
        // if validate
        if (that.opts.validate === true) {
            var $target = $(this);
            if ($target.is(":checkbox,:radio")) $target = $target.closest("[data-input-group]");
            var validationError = that.validateForm($target);
            if (validationError && that.validateErrorAction) that.validateErrorAction(validationError);
        }

        if (that.inputChangeAction) that.inputChangeAction(this);
    });

    // on Keyup
    that.$inputs.on("keyup.form", function (event) {
        if (that.keyupAction) {
            var input = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                that.keyupAction(input, event);
            }, 500);
        }
    });

    // fix number input problem
    that.$inputs.filter("[type=number]").on("keypress.form", function (event) {
        if (event.which < 48 || event.which > 57) event.preventDefault();
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
