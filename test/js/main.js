var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var DropdownMenu = require("../../modules/dropdown-menu/dropdown-menu.js");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $dropdownMenu = $(".single-col-menu");
if ($dropdownMenu) {
    var dropdown = new DropdownMenu($dropdownMenu, $("#trigger"), {
        triggerOnHover: false,
        multiSelection: false,
        multiSingle: true
    });

    dropdown.onItemClick(function () {
    });
}
