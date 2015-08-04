var FloatBox = require("../../js/float-box");
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var Form = require("../../js/form");
var Insert = require("../../js/insert");
var Alert = require("../../js/alert");

// templates
var dropdownHBS = require("../../templates/dropdown.hbs");
var modalHBS = require("../../templates/modal.hbs");
var alertHBS = require("../../templates/alert.hbs");
var textHBS = require("../../templates/text.hbs");

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
    var $button = $floatBox.find("button");
    var fbox, options;
    showcase.onInsert(function ($el) {
        fbox = new FloatBox($el, options);
        fbox.addCloseButton("button[data-type=close]");
        fbox.addListener("button[data-type=alert]", "click", function () {
            alert("yes");
        });
        fbox.onOpen(function () {
            console.log(fbox.listeners);
        });
        $button.on("click", function () {
            fbox.toggle();
        });
    });
    showcase.onDestroy(function () {
        $button.off("click");
    });

    var $select = $floatBox.find("#float-box-opts");
    $select.change(function () {
        switch ($select.val()) {
            case "dropdown":
                options = {
                    preventScroll: [".scroll1", ".scroll2"],
                    closeOnScroll: true
                };
                showcase.changeTemplate(dropdownHBS);
                showcase.reinsert({text: "this is a Dropdown"});
                break;
            case "modal":
                options = {
                    hasOverlay: true,
                    closeOnClick: true
                };
                showcase.changeTemplate(modalHBS);
                showcase.reinsert({text: "this is a Modal"});
                break;
            case "alert":
                options = {};
                showcase.changeTemplate(alertHBS);
                showcase.reinsert({text: "这是一个警告！"});
                break;
            case "dynamicAlert":
                var alert = new Alert(alertHBS);
                alert.show({text: "this is a dynamic alert!"});
                break;
            default:
                options = {};
                showcase.destroy();
                break
        }
    });
}
// form.js
var $userForm = $("#usrForm");
if ($userForm.length > 0) {
    var form = new Form($userForm, {
        validate: true
    });
    form.onSubmit(function () {
        console.log(this.getData());
    }).onBlur(function (input, validation) {
        if (validation) console.log(validation.msg);
    }).onValidateError(function (validation) {
        console.log(validation.msg);
    });
}

// insert.js
var $insert = $("#insert-test");
if ($insert.length > 0) {
    var insertButton = $insert.find("button.insert");
    var deleteButton = $insert.find("button.delete");
    var deleteAllButton = $insert.find("button.delete-all");
    var insertTarget = $insert.find(".insert-target");
    var insertion = new Insert(textHBS, insertTarget);
    insertButton.click(function () {
        insertion.insert({text: Math.random()});
    });
    deleteButton.click(function () {
        insertion.destroy();
    });
    deleteAllButton.click(function () {
        insertion.destroyAll();
    });
    insertion.onDestroy(function (el) {
        console.log(el);
    });
}