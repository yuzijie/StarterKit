// Constructor
var XHR = function (url, data, options) {
    var type = data ? "POST" : "GET";

    if (data && data["FormData"] && data["FormData"] instanceof FormData) data = data["FormData"];

    var defaultOptions = {
        url: url,
        data: data,
        type: type,
        dataType: "json"
    };

    var fileOptions = (data instanceof FormData) ? {
        processData: false,
        contentType: false
    } : {};

    this.options = $.extend(defaultOptions, fileOptions, options);

    this.xhr = null;
};

// Send XHR request
XHR.prototype.send = function () {
    if (this.xhr && this.xhr["readystate"] !== 4) this.xhr.abort();

    this.xhr = null;

    var defer = $.Deferred();

    this.xhr = $.ajax(this.options)
        .done(function (data) {
            if (data.type && data.type == "error") {
                console.log(data);
                defer.reject(data);
            }

            defer.resolve(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            var output = {
                textStatus: textStatus,
                errorThrown: errorThrown,
                xhrStatus: jqXHR.status,
                xhrResponseText: jqXHR.responseText
            };
            console.log(output);

            defer.reject();
        });

    return defer.promise();
};

// Update the "data" to be sent
XHR.prototype.updateData = function (data) {
    if (data) {

        if (data["FormData"] && data["FormData"] instanceof FormData) data = data["FormData"];

        this.options.data = data;
        this.options.type = "POST";

        if (data instanceof FormData) {
            this.options.processData = false;
            this.options.contentType = false;
        } else {
            delete this.options.processData;
            delete this.options.contentType;
        }

    } else {
        this.options.data = null;
        this.options.type = "GET";
    }
    return this;
};

XHR.prototype.updateUrl = function (url) {
    if (url && typeof url === "string") this.options.url = url;
    return this;
};

module.exports = XHR;
