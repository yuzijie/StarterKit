// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

// output
var errorObject = function (type, $element, msg) {
    // Example:
    // {error: "required", msg: "该项目为必填", element: "jQuery Object"}

    var customMsg = $element.data("validity");
    if (customMsg) msg = customMsg;

    return {
        error: type,
        element: $element,
        msg: msg
    };
};

// Check required field
var checkInputRequire = function ($input, content) {
    if (content.length > 0) return null;
    return errorObject("required", $input, "该项目为必填");
};

var checkGroup = function ($field) {
    var checked = null,
        min, max;

    if ($field.data("required") === true) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked === 0) return errorObject("required", $field, "该项目为必填");
    }
    if (min = $field.data("min-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked < min) return errorObject("min", $field, "选择不得小于" + min + "个");
    }
    if (max = $field.data("max-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked > max) return errorObject("max", $field, "选择不得大于" + max + "个");
    }
    return null;
};

var checkInput = function ($input) {
    var content = $input.val().trim(),
        validationError;

    if ($input.prop("required")) {
        validationError = checkInputRequire($input, content);
        if (validationError) return validationError;
    }
    return null;
};

var Validator = {};

Validator.check = function (field) {
    var $field = to$(field);

    if ($field.is("[data-checkbox-group],[data-radio-group]")) {
        return checkGroup($field);
    } else {
        return checkInput($field);
    }
};

module.exports = Validator;
