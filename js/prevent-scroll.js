require("../node_modules/jquery-mousewheel/jquery.mousewheel.js")($);
var PreventScroll = function ($target) {
    $target = ($target instanceof jQuery) ? $target : $($target);
    $target.on("mousewheel.preventScroll", function (e) {
        //console.log("scrollTop: " + $target.scrollTop() + " scrollHeight: " + $target[0].scrollHeight + " outerHeight: " + $target.outerHeight());
        e.stopPropagation();
        if (($target.scrollTop() >= $target[0].scrollHeight - $target.outerHeight() && e.deltaY < 0) ||
            ($target.scrollTop() <= 0 && e.deltaY > 0)) {
            e.preventDefault();
        }
    });
};
module.exports = PreventScroll;
