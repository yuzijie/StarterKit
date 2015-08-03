// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

// output
var errorObject = function (type, $element, msg) {
    // Example:
    // {error: "required", msg: "该项目为必填", element: "jQuery Object"}

    var customMsg = $element.prop("title");
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
    if ($field.data("required") === true) {
        if ($field.has(":checked").length === 0) return errorObject("required", $field, "该项目为必填")
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
