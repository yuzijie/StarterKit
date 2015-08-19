require("../node_modules/jquery-mousewheel/jquery.mousewheel.js")($);
var h = require("./helper");

var PreventScroll = function ($target) {
    $target = h.to$($target);
    $target.on("mousewheel.preventScroll", function (e) {
        e.stopPropagation();
        if (($target.scrollTop() >= $target[0].scrollHeight - $target.outerHeight() && e.deltaY < 0) ||
            ($target.scrollTop() <= 0 && e.deltaY > 0)) {
            e.preventDefault();
        }
    });
};

module.exports = PreventScroll;
