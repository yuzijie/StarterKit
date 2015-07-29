function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

//function endsWith(str, suffix) {
//    return str.indexOf(suffix, str.length - suffix.length) !== -1;
//}

var timer = null;

var Form = function (target, options) {
    this.$target = to$(target);
    this.$inputs = this.$target.find(":input");
    this.$submit = this.$target.find(":submit");
    this.allowSubmit = true;

    // Options
    this.opts = $.extend({
        preventSubmit: true
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
    context.$target.on("submit", function (event) {
        if (context.opts.preventSubmit === true) event.preventDefault();

        if (context.allowSubmit === true) {
            context.$submit.prop("disabled", true);
            context.allowSubmit = false;
            if (context.submitAction) context.submitAction(this, event);
        }
    });
};

Form.prototype.setInputListener = function (context) {
    context = context || this;

    // on Focus
    context.$inputs.on("focus", function () {
        if (context.inputFocusAction) context.inputFocusAction(this);
    });

    // on Blur
    context.$inputs.on("blur", function () {
        if (context.inputBlurAction) context.inputBlurAction(this);
    });

    // on Change
    context.$inputs.on("change", function () {
        if (context.inputChangeAction) context.inputChangeAction(this);
    });

    // on Keyup
    context.$inputs.on("keyup", function (event) {
        if (context.keyupAction) {
            var that = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                context.keyupAction(that, event);
            }, 500);
        }
    });
};

Form.prototype.refresh = function () {
    this.$inputs.off(); // remove all events

    // get all inputs and submit buttons
    this.$inputs = this.$target.find(":input");
    this.$submit = this.$target.find(":submit");

    // set Listeners
    this.setInputListener(this);
};

Form.prototype.buttonText = function (text) {
    if (this.$submit.is("button")) {
        this.$submit.text(text);
    } else {
        this.$submit.val(text);
    }
};

Form.prototype.getData = function () {
    var serializeArray = this.$target.serializeArray();
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

Form.prototype.serialize = function () {
    return this.$target.serialize();
};

Form.prototype.reEnable = function () {
    this.$submit.prop("disabled", false);
    this.allowSubmit = true;
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
