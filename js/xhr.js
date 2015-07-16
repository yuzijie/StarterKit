// Constructor
var XHR = function (url, data, options) {
    var type = (typeof data === 'object' && data !== null) ? "POST" : "GET";
    options = options || {};

    var defaultOptions = {
        url: url,
        data: data,
        type: type,
        dataType: "json"
    };

    this.options = $.extend({}, defaultOptions, options);

    this.xhr = null;
};

// Send XHR request
XHR.prototype.send = function () {

    if (this.xhr && this.xhr.readystate !== 4) {
        this.xhr.abort();
    }

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
        this.options.data = data;
        this.options.type = "POST";
    } else {
        this.options.data = null;
        this.options.type = "GET";
    }
    return this;
};

module.exports = XHR;
