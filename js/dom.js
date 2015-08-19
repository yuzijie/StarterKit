var h = require("./helper");

var $elements = {}, // list of elements that have been inserted
    index = 0; // index of new element

function insert(element, target, method, opts) {
    var $target = h.to$(target),
        $element = h.to$(element),
        allow;

    // before insert
    if (opts["beforeInsert"]) allow = opts["beforeInsert"]();

    if (allow !== false) {
        // add to DOM
        $target[method]($element);

        // cache in Elements object
        $elements[++index] = $element;

        // return index number
        return index;
    }

    return false;
}

function remove(index, opts) {
    if (!index) throw "you must provide a valid key!";

    if ($elements.hasOwnProperty(index)) {
        var allow, $element = $elements[index];

        // before remove
        if (opts["beforeRemove"]) allow = opts["beforeRemove"]($element);

        if (allow !== false) {
            // delete cache
            delete $elements[key];

            // remove from DOM
            $element.remove();

            // return deleted element
            return $element;
        }
    }

    return false;
}

function element(index) {
    if ($elements.hasOwnProperty(index)) return $elements[index];
    return false;
}

module.exports = {
    append: function (element, target, opts) {
        return insert(element, target, "append", opts);
    },
    prepend: function (element, target, opts) {
        return insert(element, target, "prepend", opts);
    },
    before: function (element, target, opts) {
        return insert(element, target, "before", opts);
    },
    after: function (element, target, opts) {
        return insert(element, target, "after", opts);
    },
    remove: remove, element: element
};
