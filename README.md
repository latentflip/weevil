# Weevil

Like `eval`, but in a webworker.

```
npm install weevil --save
```

## What?

Weevil makes it simple to `eval` JavaScript in a separate event-loop "thread" via a webworker. It also simplifies sending and receiving messages with that other thread via postmessage.

## Why?

If you're kinda crazy, then you might find this handy.


## Examples

### Basic Usage

Pass weevil a string with javascript code in it, that'll be run in the webworker.

```javascript
var weevil = require('weevil');

//This code will be run on the webworker
var workerCode = [
    "//do something slow here",
    "for (var i=0; i<1000000; i++) {",
    "  Math.pow(2,50);",
    "}",
    "console.log('done');"
].join("\n");

weevil(workerCode);
```

we can simplify generating the code with [deval](http:://github.com/latentflip/deval), of course it still can't access any of the variables in scope of the host page, but at least it's easier to write the code.

```javascript
var weevil = require('weevil');

//This code will be run on the webworker
var workerCode = deval(function () {
    //do something slow here
    for (var i=0; i<1000000; i++) {
        Math.pow(2,50);
    }
    console.log('done');
});

weevil(workerCode);
```

### Sending messages to the worker

In the context of the webworker, there is a `weevil` object which effectively acts as a simple event emitter. In the context of the main thread, the worker object returned from calling `weevil(theCode)` has the same methods:

* `weevil.emit(name, [args...])` / `worker.emit(name, [args...])` 
    * send a message to the host page / to the worker. With `name`, and optional `args` list which the `on` callback will receive. Also aliased as `weevil.send` / `worker.send`.
* `weevil.on(name, callback)` / `worker.on(name, callback)` 
    * listen to messages from the host page / from the worker. With `name` of the messages to listen for, and `callback` to run when the message is received. The callback will receive the list of `args...` from the `emit` call in the other process.
* `weevil.once(name, callback)` / `worker.once(name, callback)` 
    * as per `.on()`, listen to messages from the host page / from the worker, but only run the callback only once.
* `weevil.off(name, [callback])` / `worker.off(name, [callback])` 
    * unregister listen callback(s). If a `callback` is specified, only that callback will be deregistered for the `name`d event. If no `callback` is specified, all callbacks for message `name` will be deregistered.
* `weevil.kill()` / `worker.kill()`
    * Terminate the worker immediately, and deregister all handlers.

(Example: again using deval to generate the worker code string).

```javascript
var deval = require('deval');
var weevil = require('weevil');

//This code will run on the webworker (note it will be run in a completely different scope
var workerCode = deval(function () {
    weevil.on('count-to', function (limit) {
        var start = new Date();
        for (var i=0; i<limit; i++) {
            Math.pow(2,50);
        }
        vae end = new Date();
        weevil.emit('count-done', end - start);
    });
});

var limit = 1000000000;
var worker = weevil(workerCode);
worker.send('count-to', limit)
      .on('count-done', function (time) {
        alert('Worker counted to ' + limit + ' in ' + time + 'ms');
      });
```

## Who?

If you wish to heckle: [Philip Roberts](http://twitter.com/philip_roberts).

## License

MIT

