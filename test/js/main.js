var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var DropdownMenu = require("../../modules/dropdown-menu/dropdown-menu.js");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}

var $dropdownMenu = $(".single-col-menu");
var $input = $("#trigger");

if ($dropdownMenu) {
    var dropdown = new DropdownMenu($dropdownMenu, {
        preventClose: $input
    });

    dropdown.onMenuClose(function(){
        this.showAll().clearSelection();
    });

    dropdown.onItemClick(function($this){
        $input.find("#input").val($this.data("value"));
    });

    $input.find("#input").on("keyup", function () {
        var text = $(this).val();
        dropdown.filter(text).open();
    });

    $input.find("#input").on("focus", function () {
        dropdown.open();
    });
}
