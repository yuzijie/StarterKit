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

var Scrollbar = function () {
    this.scrollbarWidth = getScrollbarWidth();
    this.bodyPad = parseInt(($body.css('padding-right') || 0), 10);
    this.originalBodyPad = document.body.style.paddingRight || '';
};

Scrollbar.prototype.set = function () {
    if (hasScrollbar()) $body.css('padding-right', this.bodyPad + this.scrollbarWidth);
};

Scrollbar.prototype.reset = function () {
    $body.css("padding-right", this.originalBodyPad);
};

module.exports = Scrollbar;
