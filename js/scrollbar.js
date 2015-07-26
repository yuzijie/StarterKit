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
var originalBodyPad = document.body.style.paddingRight || '';

var setPadding = function () {
    if (document.body.clientWidth < window.innerWidth) {
        $body.css('padding-right', bodyPad + scrollbarWidth);
    }
};

var resetPadding = function () {
    $body.css("padding-right", originalBodyPad);
};

module.exports = {
    setPadding: setPadding,
    resetPadding: resetPadding
};
