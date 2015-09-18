var Event = function (model) {
    this.model = model;   // the model which this event belongs to
    this.listeners = [];  // all listeners for this event
    this.views = [];      // it records which view a listener belongs to
};

Event.prototype = {

    attach: function (listener, viewId) {
        this.listeners.push(listener);
        this.views.push(viewId);
    },

    detach: function (obj) {                        // detach by listener or viewId
        var id;

        if (!obj) {                                 // if object is a falsy value

            this.listeners = [];

        } else if (obj instanceof Function) {       // if object is a listener

            do {
                id = this.listeners.indexOf(obj);
                if (id !== -1) {
                    this.listeners.splice(id, 1);
                    this.views.splice(id, 1);
                }
            }
            while (id !== -1);

        } else {                                    // else treat object as a viewId

            id = this.views.length;
            while (id--) {
                if (this.views[id] == obj) {
                    this.listeners.splice(id, 1);
                    this.views.splice(id, 1);
                }
            }
        }
    },

    notify: function (args) {
        var l = this.listeners.length;
        while (l--) {
            this.listeners[l](args, this.model);
        }
    }

};

module.exports = Event;