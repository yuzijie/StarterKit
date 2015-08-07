var FloatBox = require("../../js/float-box");
var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");
var Form = require("../../js/form-with-validation");
var Insert = require("../../js/insert");
var Alert = require("../../js/alert");
var Listener = require("../../js/listener");
var Scroll = require("../../js/scroll-to");

// templates
var dropdownHBS = require("../../templates/dropdown.hbs");
var modalHBS = require("../../templates/modal.hbs");
var alertHBS = require("../../templates/alert.hbs");
var textHBS = require("../../templates/text.hbs");
var alert1HBS = require("../templates/alert1.hbs");
var alert2HBS = require("../templates/alert2.hbs");
var alert3HBS = require("../templates/alert3.hbs");
var tooltipHBS = require("../../templates/tooltip.hbs");

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
            case "tooltips":
                var tooltip = new Alert(tooltipHBS);
                tooltip.changeTarget(".target");
                tooltip.onShow(function ($el) {
                    $el.addClass("reverse");
                });
                tooltip.show({text: "this is a tooltip"});
                break;
            default:
                options = {};
                showcase.destroy();
                break
        }
    });
}

// BetterForm.js
var $userForm = $("#usrForm");
if ($userForm.length > 0) {
    new Form($userForm);
}

// insert.js
var $insert = $("#insert-test");
if ($insert.length > 0) {

    var insertButton1 = $insert.find("button.insert1");
    var insertButton2 = $insert.find("button.insert2");
    var insertButton3 = $insert.find("button.insert3");

    var deleteButton = $insert.find("button.delete");
    var deleteAllButton = $insert.find("button.delete-all");
    var insertTarget = $insert.find(".insert-target");
    var insertion = new Insert(textHBS, insertTarget);

    insertButton1.click(function () {
        insertion.changeTemplate(alert1HBS);
        insertion.onInsert(function ($el) {
            $el.data("listener", new Listener("insert", $el));
            $el.data("listener").add("button", "click", function () {
                alert("this is button 1 by Listener");
            }).on();
        });
        insertion.insert();
    });
    insertButton2.click(function () {
        insertion.changeTemplate(alert2HBS);
        insertion.onInsert(function ($el) {
            var listener = new Listener("insert", $el);
            listener.add("button", "click", function () {
                alert("this is button 2 by Listener");
            }).on();
        });
        insertion.insert();
    });
    insertButton3.click(function () {
        insertion.changeTemplate(alert3HBS);
        insertion.onInsert(function ($el) {
            var listener = new Listener("insert", $el);
            listener.add("button", "click", function () {
                alert("this is button 3 by Listener");
            }).on();
        });
        insertion.insert();
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

// scroll-to.js
var $scrollTo = $(".scroll");
if ($scrollTo.length > 0) {
    $("button").click(function () {
        Scroll(".target", {
            container: ".inner"
        });
    });
}
