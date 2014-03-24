var test = require('tape');
var weevil = require('../weevil');
var deval = require('deval');

test('it doesnt like, explode', function (t) {
    var code = deval(function () {
        console.log("Code run from webworker");
    });
    weevil(code);
    t.end();
});

test('it receives messages from the webworker', function (t) {
    var code = deval(function () {
        weevil.emit('a-message', 'some', 'stuff', 3);
    });

    var worker = weevil(code);

    worker.on('a-message', function (some, stuff, three) {
        t.equals(some, 'some');
        t.equals(stuff, 'stuff');
        t.equals(three, 3);
        t.end();
    });
});

test('it can emit messages to the webworker', function (t) {
    var code = deval(function() {
        weevil.on('do-something', function (aString, aNumber) {
            weevil.emit('did-something', "string was: " + aString, aNumber * 2);
        });
    });

    var worker = weevil(code);
    worker.on('did-something', function (resultString, resultNumber) {
             t.equals(resultString, "string was: some-string");
             t.equals(resultNumber, 4);
             t.end();
          });
    worker.emit('do-something', 'some-string', 2);
});
