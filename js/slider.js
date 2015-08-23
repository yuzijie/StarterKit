var h = require("./helper"),
    template = '<div class="slider-stage"></div>',
//transition = "left 0.6s ease";
    transition = "all 0.6s ease";


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
        $slides = toObject(slides);    // all slides

    // options
    var opts = $.extend({
        scrollNum: 1,                  // number of slides to scroll
        showNum: 1                     // number of slides to show
    }, options);

    // values
    var numSlides = $slides.length;
    var scrollable = numSlides > opts.showNum;
    var currId = opts.showNum;

    // Setup slider
    if (scrollable) {
        var i;
        for (i = numSlides - 1; i >= numSlides - opts.showNum; i--) {
            $stage.prepend($slides.eq(i).clone(true).data("slider-id", i));
        }
        for (i = 0; i < numSlides; i++) {
            $stage.append($slides.eq(i).clone(true).data("slider-id", i));
        }
        for (i = 0; i < opts.showNum; i++) {
            $stage.append($slides.eq(i).clone(true).data("slider-id", i));
        }
    } else {
        for (i = 0; i < numSlides; i++) {
            $stage.append($slides.eq(i).clone(true).data("slider-id", i));
        }
    }
    $prosc.html($stage);

    var $clones = $stage.children();
    var numClones = $clones.length;
    var stageWidth = getWidth($clones);

    // stage init
    //$stage.css("width", stageWidth).css("left", $clones.eq(currId).position().left * -1);
    $stage.css("width", stageWidth).css("transform", "translateX(" + $clones.eq(currId).position().left * -1 + "px)");


    // set listeners
    $prosc.on("nextSlides", function () {
        currId += opts.scrollNum;
        var currItem = $clones.eq(currId);

        //$stage.css({
        //    transition: transition,
        //    left: currItem.position().left * -1
        //});

        $stage.css({
            transition: transition,
            transform: "translateX(" + currItem.position().left * -1 + "px)"
        });

        if (numClones - currId < 2 * opts.showNum) {
            $prosc.one("transitionend", function () {
                var sliderId = currItem.data("slider-id");
                currItem = $clones.filter(function () {
                    return $(this).data("slider-id") === sliderId;
                });
                currId = currItem.index();
                //$stage.css({
                //    transition: "",
                //    left: currItem.position().left * -1
                //});
                $stage.css({
                    transition: "",
                    transform: "translateX(" + currItem.position().left * -1 + "px)"
                });
            });
        }
    });
};
