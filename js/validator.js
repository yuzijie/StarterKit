// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

// Check required field
var checkRequire = function ($input, content) {
    if ($input.prop("required")) {
        if (content.trim().length > 0) {
            return null;
        } else {
            return "required";
        }
    }
    return null;
};

var Validator = {};

Validator.check = function (input) {
    var validationError,
        $input = to$(input),
        content = $input.val();

    if (validationError = checkRequire($input, content)) {
        return validationError;
    }

    return null;
};

module.exports = Validator;
