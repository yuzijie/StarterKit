// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

//// Input check //////

var checkInput = function ($input) {
    var content = $input.val().trim(),
        type = $input.prop("type"),
        errorMessage;

    if ($input.prop("required")) {
        errorMessage = checkInputRequire($input, content);
        if (errorMessage) return errorMessage;
    }

    if (content && type in checkers) {
        errorMessage = checkers[type]($input, content);
        if (errorMessage) return errorMessage;
    }

    return "";
};

// input type check
var checkers = {
    email: function ($input, content) {
        // Validate Email http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        var re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
        var result = re.test(content);
        if (!result) return "您的邮箱格式不正确";
        return null;
    }
};

// Check required field
var checkInputRequire = function ($input, content) {
    if (content.length > 0) return null;
    return "请填写有效内容";
};


//////// Group check ///////

var checkGroup = function ($field) {
    var checked = null,
        min, max;

    if ($field.data("required") === true) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked === 0) return "该项目必填";
    }
    if (min = $field.data("min-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked < min) return "您的选择不得小于" + min + "个";
    }
    if (max = $field.data("max-check")) {
        if (checked === null) checked = $field.find(":checked").length;
        if (checked > max) return "您的选择不得大于" + max + "个";
    }

    return "";
};

var Validator = {};

Validator.check = function (field) {
    var $field = to$(field);

    if ($field.is("[data-input-group]")) {
        return checkGroup($field);
    } else {
        return checkInput($field);
    }
};

module.exports = Validator;
