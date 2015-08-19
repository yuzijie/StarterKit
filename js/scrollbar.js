var getScrollbarWidth = function () {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

var $body = $(document.body);
var scrollbarWidth = getScrollbarWidth();
var bodyPad = parseInt(($body.css('padding-right') || 0), 10);

// default style
var originalBodyPad = document.body.style.paddingRight || "";
var originalBodyOverflow = document.body.style.overflow || "";

var setPadding = function () {
    if (document.body.clientWidth < window.innerWidth) {
        $body.css('padding-right', bodyPad + scrollbarWidth);
    }
    $body.css("overflow", "hidden");
};

var resetPadding = function () {
    $body.css({
        "padding-right": originalBodyPad,
        "overflow": originalBodyOverflow
    });
};

module.exports = {
    setPadding: setPadding,
    resetPadding: resetPadding
};
