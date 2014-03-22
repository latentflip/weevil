var weevil = require('../weevil');

var workerCode = [
    "//do something slow here",
    "for (var i=0; i<1000000; i++) {",
    "  Math.pow(2,20);",
    "}",
    "console.log('done');"
].join("\n");

weevil(workerCode);

//or with deval

var deval = require('deval');

var workerCode = deval(function () {
    //do something slow here
    for (var i=0; i<1000000; i++) {
        Math.pow(2,50);
    }
    console.log('done');
});

weevil(workerCode);
