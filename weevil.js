var deval = require('deval');

function emitterFor (scope) {
    var inWebworkerThread = typeof Window === void 0;

    var onMessage = function (message) {
        var cbs;
        message = JSON.parse(message.data);

        if (!message.weevil) return;

        cbs = weevil.callbacks[message.name];
        if (!cbs || !cbs.length) return;

        cbs.forEach(function (cb) {
            cb.apply(cb, message.args);
        });
    };

    var weevil = {
        callbacks: {},
        once: function (name, fn) {
            var _self = this;
            var on = function () {
                _self.off(name, on);
                fn.apply(_self, arguments);
            };

        },
        on: function (name, fn) {
            this.callbacks[name] = this.callbacks[name] || [];
            this.callbacks[name].push(fn);
            return this;
        },
        off: function (name, fn) {
            var callbacks = this.callbacks[name];
            var i;

            if (!callbacks || !callbacks.length) return;

            if (!fn) delete this.callbacks[name];

            i = callbacks.indexOf(fn);
            callbacks.splice(i, 1);
            return this;
        },
        send: function () {
            return this.emit.apply(this, arguments);
        },
        emit: function (name /*, [args...] */) {
            var args = Array.prototype.slice.call(arguments);

            scope.postMessage(JSON.stringify({
                name: args.shift(),
                args: args,
                weevil: true
            }));

            return this;
        },
        kill: function () {
            this.callbacks = {};
            scope.removeEventListener("message", onMessage, false);
            if (inWebworkerThread) {
                scope.close();
            } else {
                scope.terminate();
            }
        }
    };

    scope.addEventListener("message", onMessage, false);

    return weevil;
}

var prelude = deval(function (emitterCode) {
    var weevil = (function () {
        //Import emitter code
        $emitterCode$;

        return emitterFor(self);
    })();

    //user code, with access to weevil;
}, emitterFor.toString());

function weevil (code) {
    code = deval(function (prelude, code) {
        //Prelude code
        $prelude$;

        //User code
        $code$;
    }, prelude, code);

    var blob = new Blob([code], { type: 'application/javascript' });
    var worker = new Worker(URL.createObjectURL(blob));

    return emitterFor(worker);
}

module.exports = weevil;
