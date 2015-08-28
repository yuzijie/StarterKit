var h = require("./helper"),
    anim = require("./anim-detect");

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

function getWidth(element) {
    return element.outerWidth();
}

////////////// Main //////////////
module.exports.transform = function (container, slides, options) {
    if (!container) throw "invalid slider container!";

    var $stage = h.to$(container),     // visible area
        $slides = toObject(slides),    // all slides
        $clones = $slides.clone(true); // all clones

    // options
    var opts = $.extend({
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1                     // number of slides to show
    }, options);

    // values
    var currId = 0;
    var numSlides = $clones.length;

    // Setup slider
    $stage.append($clones);

    // set listeners
    $stage.on("nextSlides", function () {
        var nextId = currId + 1 >= numSlides ? 0 : currId + 1;

        var nextSlide = $clones.eq(nextId);
        var currSlide = $clones.eq(currId);

        var width = getWidth(nextSlide);

        // prepare
        nextSlide.css("right", width * -1).addClass("ready anim");
        currSlide.addClass("anim");

        // move
        currSlide.css(anim.transform, "translateX(-" + width + "px)");
        nextSlide.css(anim.transform, "translateX(-" + width + "px)");

        // when done
        currId = nextId;

        // after transition finish
        anim.tranFinish(true, nextSlide, function () {
            nextSlide.addClass("active").removeClass("ready anim");
            currSlide.removeClass("active anim");
            nextSlide.css(anim.transform, "").css("right", "");
            currSlide.css(anim.transform, "");
        });
    });
};
