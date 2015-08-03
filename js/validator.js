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

// input type check
var checkers = {
    email: function ($input, content) {
        // Validate Email http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        var re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
        var result = re.test(content);
        if (!result) return errorObject("email", $input, "邮箱格式不正确");
        return null;
    }
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
        if (checked === 0) return errorObject("required", $field, "请给出选择");
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
        type = $input.prop("type"),
        validationError;

    if ($input.prop("required")) {
        validationError = checkInputRequire($input, content);
        if (validationError) return validationError;
    }

    if (content && type in checkers) {
        validationError = checkers[type]($input, content);
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
