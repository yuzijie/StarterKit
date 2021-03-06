var h = require("./helper");

var checkers = {
    email: function (content) {
        // Validate Email http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        var re = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
        var result = re.test(content);
        if (!result) return "email";
    },
    min: function (content, condition) {
        var num = Number(content), min = Number(condition);
        if (num < min) return "min";
    },
    max: function (content, condition) {
        var num = Number(content), max = Number(condition);
        if (num > max) return "max";
    },
    "data-not-zero": function (content) {
        var num = Number(content);
        if (num === 0) return "zero";
    }
};

//////// Input check ///////
var checkInput = function ($input) {
    var content = $input.val().trim(), type = $input.prop("type"), msg, i, l, attr, obj;

    // check require
    if ($input.prop("required") && !content.length) return "require";

    // check format
    if (content.length && (type in checkers) && (msg = checkers[type](content))) return msg;

    // check content
    if (content.length) {
        attr = $input[0].attributes;
        for (i = 0, l = attr.length; i < l; i++) {
            obj = attr[i];
            if (checkers.hasOwnProperty(obj.name) && (msg = checkers[obj.name](content, obj.value))) return msg;
        }
    }

    // no error
    return "ok";
};

//////// Group check ///////
var checkGroup = function ($field) {
    var checked = null, min, max;

    if ($field.data("required") === true) {
        if (checked == null) checked = $field.find(":checked").length;
        if (checked === 0) return "require";
    }

    if (min = $field.data("min")) {
        if (checked == null) checked = $field.find(":checked").length;
        if (checked < min) return "min";
    }

    if (max = $field.data("max")) {
        if (checked == null) checked = $field.find(":checked").length;
        if (checked > max) return "max";
    }

    return "ok";
};

//////// Modules ///////
var check = function (field) {
    var $field = h.to$(field);
    if ($field.is("[data-input-group]")) return checkGroup($field);
    return checkInput($field);
};

module.exports = check;
