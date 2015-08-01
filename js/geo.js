var hasApi = function () {
    if ("geolocation" in navigator) {
        return true;
    } else {
        window.alert("请更新您的浏览器或手机！");
        return false;
    }
};

var Geo = function (options) {
    // Watcher
    this.watcher = null;

    // Options
    this.opts = $.extend({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 1000
    }, options || {});

    // Actions
    this.waitingAction = null;   // before getting the location info
    this.successAction = null;   // after getting the location
    this.permDenyAction = null;  // user disallow location detection
    this.unavailAction = null;   // position unavailable
    this.timeoutAction = null;   // detecting location timeout

    // Start watching
    this.restart();
};

Geo.prototype.start = function () {
    if (!this.watcher && hasApi()) {
        if (this.waitingAction) this.waitingAction();
        this.watcher = navigator.geolocation.watchPosition(this.success, this.error, this.opts);
    }
    return this;
};

Geo.prototype.stop = function () {
    if (this.watcher) {
        navigator.geolocation.clearWatch(this.watcher);
        this.watcher = null;
    }
    return this;
};

Geo.prototype.restart = function () {
    this.stop().start();
    return this;
};

Geo.prototype.success = function (position) {
    if (this.successAction) this.successAction(position);
    return this;
};

Geo.prototype.error = function (err) {
    switch (err.code) {
        case err.PERMISSION_DENIED:
            if (this.permDenyAction) {
                this.permDenyAction(err);
            } else {
                console.log("user denied permission!");
            }
            break;
        case err.POSITION_UNAVAILABLE:
            if (this.unavailAction) {
                this.unavailAction(err);
            } else {
                console.log("Location unavailable!");
            }
            break;
        case err.TIMEOUT:
            if (this.timeoutAction) {
                this.timeoutAction(err);
            } else {
                console.log("detection timeout!");
            }
            break;
        default:
            console.log("Unknown error");
            break;
    }
    return this;
};

Geo.prototype.onWaiting = function (func) {
    if ($.isFunction(func)) this.waitingAction = func;
    return this;
};

Geo.prototype.onSuccess = function (func) {
    if ($.isFunction(func)) this.successAction = func;
    return this;
};

Geo.prototype.onPermissionDenied = function (func) {
    if ($.isFunction(func)) this.permDenyAction = func;
    return this;
};

Geo.prototype.onPositionUnavailable = function (func) {
    if ($.isFunction(func)) this.unavailAction = func;
    return this;
};

Geo.prototype.onTimeout = function (func) {
    if ($.isFunction(func)) this.timeoutAction = func;
    return this;
};

module.exports = Geo;
