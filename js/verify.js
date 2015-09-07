var h = require("./helper"),
    check = require("./validator"),
    XHR = require("./xhr");

var request = new XHR("");

// all text inputs
var textInputs = [
    '[type=text]',
    '[type=email]',
    '[type=number]',
    '[type=url]',
    '[type=password]'
];

// other inputs
var otherInputs = [
    '[type=radio]',
    '[type=checkbox]',
    '[data-input-group]',
    'textarea',
    'select'
];

// make form to be able to validate
function transform(form, options) {
    var $form = h.to$(form), timer = null, opts = options || {};

    // fix input problems
    fixInput($form);

    // text input listeners
    $form.find(textInputs.join(",")).on("keyup", function (e) {
        clearTimeout(timer);
        timer = setTimeout(function () {
            validate($(e.target));
        }, 500);
    });

    // remote validation listeners
    $form.find("input[data-remote-url]").on("blur", function () {
        var $this = $(this),
            url = $this.data("remote-url"),
            name = $this.attr("name"),
            value = $this.val().trim();

        if (value.length && $this.data("validation") === "ok") {
            var data = {};
            data[name] = value;

            request.updateUrl(url).updateData(data).send().done(function (data) {
                if (data.type !== "ok") {
                    $this.addClass("invalid-field");
                    $this.data("validation", data.type);
                }
            });
        }
    });

    // input group listeners
    $form.find("[type=radio], [type=checkbox]").on("change", function (e) {
        var $target = $(e.target);
        var $group = $target.closest("[data-input-group]");
        if ($group.length) validate($group);
    });

    // select listeners
    $form.find("select").on("change", function (e) {
        var $target = $(e.target);
        validate($target);
    });

    // submit listeners
    $form.on("submit", function (e) {
        $form.find(textInputs.concat(otherInputs).join(",")).each(function () {
            validate($(this));
        });
        if ($form.has(".invalid-field").length) {
            e.preventDefault();
        } else if (opts["submit"]) {
            e.preventDefault();
            $form.find(":submit").prop("disabled", true);
            opts["submit"]($form);
        }
    });
}

function validate($input) {
    var type = check($input), // error type
        validation = $input.data("validation");

    if (type !== "ok") {
        $input.addClass("invalid-field");
        $input.data("validation", type);
    } else if (validation !== "occupy") {
        $input.data("validation", type);
        $input.removeClass("invalid-field");
    }
}

function fixInput($form) {
    // number input cannot input anything other than number
    $form.find("input[type=number]").on("keypress", function (e) {
        if (e.which < 48 || e.which > 57) e.preventDefault();
    });
}

// format data into human readable array
function formatData(form) {
    form = h.to$(form);

    var serializeArray = form.serializeArray(),
        output = {};

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
}

module.exports = {
    transform: transform,
    formatData: formatData
};