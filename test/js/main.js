var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var DropdownMenu = require("../../modules/dropdown-menu/dropdown-menu.js");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $dropdownMenu = $(".single-col-menu");
var $button = $("#trigger");

if ($dropdownMenu) {
    var dropdown = new DropdownMenu($dropdownMenu, {
        preventClose: $button,
        closeOnScroll: false,
        multiSelection: false
    });
    $button.on("click", function () {
        dropdown.toggle();
    });
}
