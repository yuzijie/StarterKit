var FloatBox = require("../../js/float-box");
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var Form = require("../../js/form");
var Insert = require("../../js/insert");

// templates
var dropdownHBS = require("../../templates/dropdown.hbs");
var modalHBS = require("../../templates/modal.hbs");
var alertHBS = require("../../templates/alert.hbs");

// spin kit
var $spinkit = $(".spinkit");
if ($spinkit.length > 0) {
    $spinkit.append(template);
}

// float-box.js
var $floatBox = $(".float-box");
if ($floatBox.length > 0) {
    var $target = $(".target"); // to show elements
    var showcase = new Insert(dropdownHBS, $target);
    var fbox, options;
    showcase.onInsert(function ($el) {
        fbox = new FloatBox($el, options);
        fbox.self.find("button").click(function () {
            console.log("yeah close");
            fbox.close();
        });
    });

    var $select = $floatBox.find("#float-box-opts");
    $select.change(function () {
        switch ($select.val()) {
            case "dropdown":
                options = {
                    closeOnClick: true,
                    preventScroll: [".scroll1", ".scroll2"],
                    closeOnScroll: true
                };
                showcase.changeTemplate(dropdownHBS);
                showcase.reinsert({text: "this is a dropdown"});
                break;
            case "modal":
                options = {
                    hasOverlay: true,
                    closeOnClick: true
                };
                showcase.changeTemplate(modalHBS);
                showcase.reinsert({text: "this is a dropdown"});
                break;
            case "alert":
                showcase.changeTemplate(alertHBS);
                showcase.reinsert({text: "这是一个警告！"});
                break;
            default:
                showcase.destroy();
                break
        }
    });
    $floatBox.find("button").click(function () {
        fbox.toggle();
    });
}
// form.js
var $userForm = $("#usrForm");
if ($userForm.length > 0) {
    var form = new Form($userForm);
    form.onSubmit(function () {
        console.log(this.getData());
        console.log(this.$target.serialize());
    });
}
