var h = require("./helper");

var $elements = {}, // list of elements that have been inserted
    index = 0; // index of new element

function insert(element, target, method, afterInsert) {
    if (!element || !target) throw "element or target missing!";
    var $target = h.to$(target), $element = h.to$(element);

    // add to DOM
    $target[method]($element.data("domId", ++index));

    // cache element
    $elements[index] = $element;

    // after insert
    if (afterInsert) afterInsert($element);

    // return index number
    return index;
}

function remove(IDorEL, beforeRemove) {
    var index;

    if ($.isNumeric(IDorEL)) {
        index = IDorEL;
    } else {
        index = h.to$(IDorEL).data("domId");
    }

    if (!index) throw "no dom id!";

    if ($elements.hasOwnProperty(index)) {
        var allow, $element = $elements[index];

        // before remove
        if (beforeRemove) allow = beforeRemove($element);

        if (allow !== false) {
            // delete cache
            delete $elements[index];

            // remove from DOM
            $element.remove();

            return true;
        }
    }
    return false;
}

function element(index) {
    if ($elements.hasOwnProperty(index)) return $elements[index];
    if (index === "all") return $elements;
    return false;
}

module.exports = {
    append: function (element, target, func) {
        return insert(element, target, "append", func);
    },
    prepend: function (element, target, func) {
        return insert(element, target, "prepend", func);
    },
    before: function (element, target, func) {
        return insert(element, target, "before", func);
    },
    after: function (element, target, func) {
        return insert(element, target, "after", func);
    },
    remove: remove, element: element
};
