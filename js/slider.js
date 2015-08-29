var h = require("./helper"),
    anim = require("./anim");

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
        $clones;

    // options
    var opts = $.extend({
        clone: true,                   // clone original elements
        adaptive: false,               // adaptive height
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1                     // number of slides to show
    }, options);

    // setup slides
    if (opts.clone === true) {
        $clones = $slides.clone(true); // clone all slides
        $stage.append($clones);        // Setup slider
    } else {
        $clones = $slides;             // use original slides
    }
    $clones.eq(0).addClass("active");

    // values
    var currId = 0;
    var numSlides = $clones.length;
    var running = false; // whether transition is running

    // set listeners
    $stage.on("nextSlides", function () {
        if (running === false) {
            running = true;

            var nextId = currId + 1 >= numSlides ? 0 : currId + 1,
                nextSlide = $clones.eq(nextId),
                currSlide = $clones.eq(currId),
                width = getWidth(nextSlide);

            // prepare
            nextSlide.css("right", width * -1).addClass("ready anim");
            currSlide.addClass("anim");

            // adaptive height
            if (opts.adaptive === true) $stage.css(nextSlide.outerHeight());

            // move
            currSlide.css(anim.transform, "translateX(-" + width + "px)");
            nextSlide.css(anim.transform, "translateX(-" + width + "px)");
            currId = nextId;

            // after transition finish
            anim.finish(nextSlide, function () {
                nextSlide.addClass("active").removeClass("ready anim");
                currSlide.removeClass("active anim").css(anim.transform, "");
                nextSlide.css("right", "").css(anim.transform, "");
                running = false;
            });
        }
    });

    $stage.on("prevSlides", function () {
        if (running === false) {
            running = true;

            var prevId = currId === 0 ? numSlides - 1 : currId - 1,
                prevSlide = $clones.eq(prevId),
                currSlide = $clones.eq(currId),
                width = getWidth(prevSlide);

            // prepare
            prevSlide.css("left", width * -1).addClass("ready anim");
            currSlide.addClass("anim");

            // adaptive height
            if (opts.adaptive === true) $stage.css(prevSlide.outerHeight());

            // move
            currSlide.css(anim.transform, "translateX(" + width + "px)");
            prevSlide.css(anim.transform, "translateX(" + width + "px)");
            currId = prevId;

            // after transition finish
            anim.finish(prevSlide, function () {
                prevSlide.addClass("active").removeClass("ready anim");
                currSlide.removeClass("active anim").css(anim.transform, "");
                prevSlide.css("left", "").css(anim.transform, "");
                running = false;
            });
        }
    });

    // buttons click events
    $stage.find("*[data-next-slides]").on("click", function (e) {
        e.preventDefault();
        $stage.trigger("nextSlides");
    });

    $stage.find("*[data-prev-slides]").on("click", function (e) {
        e.preventDefault();
        $stage.trigger("prevSlides");
    });
};
