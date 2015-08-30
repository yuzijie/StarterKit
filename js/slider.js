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

function getHeight(element) {
    return element.outerHeight();
}

function validateId(id, numSlides) {
    return $.isNumeric(id) && id >= 0 && id < numSlides;
}

// move functions
function moveLeft($current, $future, $stage, rState, opts) {
    var cWidth = getWidth($current),
        fWidth = getWidth($future);

    // prepare
    $future.css("right", fWidth * -1).addClass("ready anim");
    $current.addClass("anim");

    // adaptive Height
    if (opts.adaptiveHeight === true) $stage.css("height", getHeight($future));

    // move
    $current.css(anim.transform, "translateX(-" + cWidth + "px)");
    $future.css(anim.transform, "translateX(-" + cWidth + "px)");

    // after transition finish
    anim.finish($future, function () {
        $future.addClass("active").removeClass("ready anim");
        $current.removeClass("active anim").css(anim.transform, "");
        $future.css("right", "").css(anim.transform, "");
        rState(false);
    });
}

function moveRight($current, $future, $stage, rState, opts) {
    var cWidth = getWidth($current),
        fWidth = getWidth($future);

    // prepare
    $future.css("left", fWidth * -1).addClass("ready anim");
    $current.addClass("anim");

    // adaptive height
    if (opts.adaptiveHeight === true) $stage.css("height", getHeight($future));

    // move
    $current.css(anim.transform, "translateX(" + cWidth + "px)");
    $future.css(anim.transform, "translateX(" + cWidth + "px)");

    // after transition finish
    anim.finish($future, function () {
        $future.addClass("active").removeClass("ready anim");
        $current.removeClass("active anim").css(anim.transform, "");
        $future.css("left", "").css(anim.transform, "");
        rState(false);
    });
}

function moveUp($current, $future, $stage, rState, opts) {
    var cHeight = getHeight($current),
        fHeight = getHeight($future);

    // prepare
    $future.css("bottom", fHeight * -1).addClass("ready anim");
    $current.addClass("anim");

    // adaptive width
    if (opts.adaptiveHeight === true) $stage.css("height", fHeight);

    // move
    $current.css(anim.transform, "translateY(-" + cHeight + "px)");
    $future.css(anim.transform, "translateY(-" + cHeight + "px)");

    // after transition finish
    anim.finish($future, function () {
        $future.addClass("active").removeClass("ready anim");
        $current.removeClass("active anim").css(anim.transform, "");
        $future.css("bottom", "").css(anim.transform, "");
        rState(false);
    });
}

function moveDown($current, $future, $stage, rState, opts) {
    var cHeight = getHeight($current),
        fHeight = getHeight($future);

    // prepare
    $future.css("top", fHeight * -1).addClass("ready anim");
    $current.addClass("anim");

    // adaptive width
    if (opts.adaptiveHeight === true) $stage.css("height", fHeight);

    // move
    $current.css(anim.transform, "translateY(" + cHeight + "px)");
    $future.css(anim.transform, "translateY(" + cHeight + "px)");

    // after transition finish
    anim.finish($future, function () {
        $future.addClass("active").removeClass("ready anim");
        $current.removeClass("active anim").css(anim.transform, "");
        $future.css("top", "").css(anim.transform, "");
        rState(false);
    });
}

function fade($current, $future, $stage, rState, opts) {

    // prepare
    $future.addClass("anim");
    $current.addClass("anim");

    // adaptive width
    if (opts.adaptiveHeight === true) $stage.css("height", getHeight($future));

    // fade in and out
    $current.removeClass("active");
    $future.addClass("active");

    // after transition finish
    anim.finish($future, function () {
        $future.removeClass("anim");
        $current.removeClass("anim");
        rState(false);
    });
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
        adaptiveHeight: false,         // adaptive height
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1,                    // number of slides to show
        direction: "horizontal"        // horizontal or vertical or fade
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
    $stage.on("toSlides", function (event, options) { // go to slides by indices
        var opts = options || {};
        if (!validateId(opts.id, numSlides)) throw "slider.js: invalid IDs";
        if (running === false) {
            //running = true;
        }
    });

    $stage.on("nextSlides", function () {
        if (running === false) {
            rState(true);

            var nextId = currId + 1 >= numSlides ? 0 : currId + 1,
                nextSlide = $clones.eq(nextId),
                currSlide = $clones.eq(currId);

            currId = nextId;

            switch (opts.direction) {
                case "horizontal":
                    moveLeft(currSlide, nextSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
                case "vertical":
                    moveDown(currSlide, nextSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
                default:
                    fade(currSlide, nextSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
            }
        }
    });

    $stage.on("prevSlides", function () {
        if (running === false) {
            running = true;

            var prevId = currId === 0 ? numSlides - 1 : currId - 1,
                prevSlide = $clones.eq(prevId),
                currSlide = $clones.eq(currId);

            currId = prevId;

            switch (opts.direction) {
                case "horizontal":
                    moveRight(currSlide, prevSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
                case "vertical":
                    moveUp(currSlide, prevSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
                default:
                    fade(currSlide, prevSlide, $stage, rState, {
                        adaptiveHeight: opts.adaptiveHeight
                    });
                    break;
            }
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

    // helper
    function rState(boolean) {
        running = boolean;
    }
};
