var deval = require('deval');
var weevil = require('../weevil');

//This code will run on the webworker (note it will be run in a completely different scope
var workerCode = deval(function () {
    weevil.on('count-to', function (limit) {
        var i, start, end;
        start = new Date();
        for (i=0; i<limit; i++) {
            Math.pow(2,50);
        }
        end = new Date();
        weevil.emit('count-done', end - start);
    });
});

var limit = 1000000000;
var worker = weevil(workerCode);
worker.emit('count-to', limit)
      .on('count-done', function (time) {
        alert('Worker counted to ' + limit + ' in ' + time + 'ms');
      });
