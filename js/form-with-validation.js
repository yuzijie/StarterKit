var Form = require("./form");

var BetterForm = function (target) {
    this.form = new Form(target, {
        validate: true
    });
};

module.exports = BetterForm;
