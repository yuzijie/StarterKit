var Ev = function (sender) {
    this.sender = sender;
    this.listeners = [];
};

Ev.prototype = {

    attach: function (listener) {
        this.listeners.push(listener);
    },

    notify: function (args) {
        var i = this.listeners.length;
        while (i--) {
            this.listeners[i](args, this.sender);
        }
    }

};

