var hasApi = function () {
    if ("geolocation" in navigator) {
        return true;
    } else {
        window.alert("请更新您的浏览器或手机！");
        return false;
    }
};

var success = function (position) {
    return position;
};

var error = function (err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
};

var Geo = function (options) {
    // options
    this.opts = $.extend({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 1000
    }, options || {});

    // start watching
    if (hasApi()) {
        this.watcher = navigator.geolocation.watchPosition(success, error, this.opts);
    }
};

Geo.prototype.stopWatching = function () {
    if (this.watcher) {
        navigator.geolocation.clearWatch(this.watcher);
        this.watcher = null;
    }
};

Geo.prototype.onSuccess = function (func) {
    if ($.isFunction(func)) success = func;
};

Geo.prototype.onError = function (func) {
    if ($.isFunction(func)) error = func;
};

module.exports = Geo;
