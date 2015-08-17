module.exports.to$ = function (item) {
    return (item instanceof jQuery) ? item : $(item);
};

module.exports.r4 = function () {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};