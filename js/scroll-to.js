// helper function
function to$(item) {
    return (item instanceof jQuery) ? item : $(item);
}

var scrollTo = function (target, container) {
    target = to$(target);
    container = (container) ? to$(container) : $(window);

    container.scrollTop(
        target.offset().top - container.offset().top + container.scrollTop()
    );
};

module.exports = scrollTo;
