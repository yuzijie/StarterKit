var $body = $(document.body);

// From bootstrap
// Check if scrollbar is appearing now
var hasScrollbar = function () {
    var fullWindowWidth = window.innerWidth;

    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
        var documentElementRect = document.documentElement.getBoundingClientRect();
        fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }

    return document.body.clientWidth < fullWindowWidth;
};

var getScrollbarWidth = function () {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
};

var scrollbarWidth = getScrollbarWidth();
var bodyPad = parseInt(($body.css('padding-right') || 0), 10);
var originalBodyPad = document.body.style.paddingRight || '';

var setPadding = function () {
    if (hasScrollbar()) $body.css('padding-right', bodyPad + scrollbarWidth);
};

var resetPadding = function () {
    $body.css("padding-right", originalBodyPad);
};

module.exports = {
    setPadding: setPadding,
    resetPadding: resetPadding
};