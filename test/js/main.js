var template = require("../../modules/spin-kit/templates/sk-circle.js")("spinner");

var $spinkit = $(".spinkit");
if ($spinkit) {
    $spinkit.append(template);
}
