var timer = null;

// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var Form = function (target, options) {
    this.self = to$(target);
    this.$inputs = this.self.find(":input");
    this.$submit = this.self.find(":submit");
    this.allowSubmit = true;

    // Options
    this.opts = $.extend({
        preventDefaultSubmit: true
    }, options || {});

    // Actions
    this.inputFocusAction = null;
    this.inputBlurAction = null;
    this.inputChangeAction = null;
    this.keyupAction = null;
    this.submitAction = null;

    // set Listener
    this.setInputListener(this);
    this.setSubmitListener(this);
};

Form.prototype.setSubmitListener = function (context) {
    context = context || this;

    // on Submit
    context.self.on("submit.form", function (event) {
        if (context.opts.preventDefaultSubmit === true) event.preventDefault();

        if (context.allowSubmit === true) {
            context.disableSubmit();
            if (context.submitAction) context.submitAction(context.getFormUrl(), context.getPostData());
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
        if (context.inputBlurAction) context.inputBlurAction(this);
    });

    // on Change
    context.$inputs.on("change.form", function () {
        if (context.inputChangeAction) context.inputChangeAction(this);
    });

    // on Keyup
    context.$inputs.on("keyup.form", function (event) {
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

Form.prototype.updateElements = function () {
    // get all inputs and submit buttons
    this.$inputs = this.self.find(":input");
    this.$submit = this.self.find(":submit");
    // set Listeners
    this.setInputListener(this);
    this.setSubmitListener(this);
};

Form.prototype.buttonText = function (text) {
    if (this.$submit.is("button")) {
        this.$submit.text(text);
    } else {
        this.$submit.val(text);
    }
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

module.exports = Form;
