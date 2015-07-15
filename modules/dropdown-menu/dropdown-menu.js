var Dropdown = function ($dropdown) {
    this.$dropdown = $dropdown;
    this.$menu = this.$dropdown.parent();
    this.$menu.css("position", "relative");
};

Dropdown.prototype.listen = function () {
    var self = this;
    $(document).on("click", function (e) {
        if (!self.$dropdown.is(e.target)
            && self.$dropdown.has(e.target).length === 0
            && self.$menu.has(e.target).length === 0) {
            self.$dropdown.hide();
        }
    });
    self.$menu.on("click", "a", function () {
        self.$dropdown.toggle();
    });
};

module.exports = Dropdown;
