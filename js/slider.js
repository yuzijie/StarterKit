var h = require("./helper"),
    template = '<div class="slider-stage"></div>',
    transition = "left 0.6s ease";

///////////// Helper /////////////
function toObject(slides) {
    var output = [];

    switch ($.type(slides)) {
        case "string":
            output = $(slides);
            break;
        case "object":
            if (slides instanceof jQuery) output = slides;
            break;
        case "array":
            $.each(slides, function (id, item) {
                output = output.concat($(item).toArray());
            });
    }

    output = h.to$(output);
    if (output.length === 0) throw "invalid slides!";
    return output;
}

function getWidth(elements) {
    var width = 0;
    elements.each(function () {
        width += this.offsetWidth;
    });
    return width;
}

////////////// Main //////////////
module.exports.transform = function (container, slides, options) {
    if (!container) throw "invalid slider container!";

    var $prosc = h.to$(container),     // visible area (proscenium)
        $stage = $(template),          // stage
        $slides = toObject(slides),    // all slides
        $clones = $slides.clone(true); // slides clone

    // options
    var opts = $.extend({
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1                     // number of slides to show
    }, options);

    // values
    var numSlides = $slides.length,    // number of slides
        scrollable = numSlides > opts.showNum,
        i, origin, stageId = opts.showNum;

    // build slider
    if (scrollable) for (i = numSlides - 1; i >= numSlides - opts.showNum; i--) { // prepend
        origin = $slides.eq(i);
        $stage.prepend(origin.clone(true).attr("data-clone-id", i));
    }

    $stage.append($clones); // real slides

    if (scrollable) for (i = 0; i < opts.showNum; i++) { // append
        origin = $slides.eq(i);
        $stage.append(origin.clone(true).attr("data-clone-id", i));
    }

    origin = null;

    $prosc.html($stage);
    var stageWidth = getWidth($stage.children());
    var currSlide = $clones.eq(0);
    $stage.css("width", stageWidth).css("left", currSlide.position().left * -1);

    // set Listeners
    $prosc.on("nextSlides", function () {
        stageId += opts.scrollNum;

        var stageEl = $stage.children(":eq(" + stageId + ")");
        $stage.css({
            left: stageEl.position().left * -1,
            transition: transition
        });
        var cloneId = stageEl.data("clone-id");
        if ($.isNumeric(cloneId)) {
            stageId = opts.showNum;
            $stage.one("transitionend", function () {
                $stage.css({
                    transition: "",
                    left: $clones.eq(cloneId).position().left * -1
                });

            });
        }
    });

    $prosc.on("prevSlides", function () {
        stageId -= opts.scrollNum;
        var stageEl = $stage.children(":eq(" + stageId + ")");
        $stage.css({
            left: stageEl.position().left * -1,
            transition: transition
        });
        var cloneId = stageEl.data("clone-id");
        if ($.isNumeric(cloneId)) {
            stageId = numSlides - opts.showNum + 1;
            $stage.one("transitionend", function () {
                $stage.css({
                    transition: "",
                    left: $clones.eq(cloneId).position().left * -1
                });
            });
        }
    });
};
