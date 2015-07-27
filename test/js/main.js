var FloatBox = require("../../js/float-box");

var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var dropdownHBS = require("../../templates/dropdown.hbs");
var modalHBS = require("../../templates/modal.hbs");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $floatBox = $(".float-box");
if ($floatBox.length > 0) {
    var $target = $(".target");
    var $button = $floatBox.find("button");
    $floatBox.find("#float-box-opts").on("change", function () {
        var text, html, opts, floatbox;

        switch ($(this).val()) {
            case "dropdown":
                $button.off();
                text = {text: "this is a dropdown"};
                html = dropdownHBS(text);
                opts = {
                    closeOnClick: true,
                    preventClose: ["#float-box-opts", $button],
                    preventScroll: [".scroll1", ".scroll2"],
                    closeOnScroll: true
                };
                break;
            case "modal":
                $floatBox.find("button").off();
                text = {text: "this is a modal"};
                html = modalHBS(text);
                opts = {
                    hasOverlay: true,
                    closeOnClick: true,
                    preventClose: $button
                };
                break;
            default:
                html = null;
                break;
        }

        if (html) {
            floatbox = new FloatBox(html, opts);
            floatbox.attachTo($target);
            $floatBox.find("button").on("click", function () {
                floatbox.toggle();
            });
        }
    });
}

