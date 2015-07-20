// prevent parent element from scrolling when scroll child element
// require jQuery Mouse Wheel Plugin
require("../node_modules/jquery-mousewheel/jquery.mousewheel.js")($);

var PreventScroll = function ($target) {
    $target.on("mousewheel", function (e) {
        if (($target.scrollTop() === $target[0].scrollHeight - $target.outerHeight() && e.deltaY < 0) ||
            ($target.scrollTop() === 0 && e.deltaY > 0)) {
            e.preventDefault();
        }
    });
};

module.exports = PreventScroll;
